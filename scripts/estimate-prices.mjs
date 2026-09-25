// Fills the price template's empty rows with ESTIMATED prices derived from the website's current prices,
// so the new SKUs can go live before the official price list exists. Replace estimates in the output file
// with official prices later and re-run build-catalogue-data.mjs.
//
//   node scripts/estimate-prices.mjs [template CSV] [output CSV]
//   defaults: docs/price-template-new-skus.csv → docs/price-list-new-skus.csv
//
// Method (all from src/data/products.json):
//   Standard — price by sign area. Each existing size contributes its most common Standard price, weighted by
//     how many SKUs use it; a weighted isotonic (never-decreasing) fit removes one-off outliers; new sizes are
//     read off that curve by linear interpolation. Above the largest sold size the last slope continues; below
//     the smallest, the lowest price applies. Rounded to 1,000 ₫.
//   Outdoor — Standard × the Outdoor/Standard ratio of the site's most-sold size (150 × 150 mm: 540,000 / 74,000),
//     rounded to 10,000 ₫ like today's Outdoor prices.
//   USD — VND ÷ the site's current rate (VND/USD of the existing prices), 2 decimals.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const repo = fileURLToPath(new URL('..', import.meta.url));
const templatePath = process.argv[2] ?? join(repo, 'docs', 'price-template-new-skus.csv');
const outPath = process.argv[3] ?? join(repo, 'docs', 'price-list-new-skus.csv');
const products = JSON.parse(readFileSync(join(repo, 'src', 'data', 'products.json'), 'utf8'));

// --- anchors: most common Standard price per existing size (orientation-free), weighted by SKU count
const bySize = new Map();
for (const p of products) {
  const key = [p.dimensions.first_mm, p.dimensions.second_mm].sort((a, b) => a - b).join('x');
  const entry = bySize.get(key) ?? { area: p.dimensions.first_mm * p.dimensions.second_mm / 100, Standard: [], Outdoor: [] };
  entry[p.edition].push(p.prices.VND); bySize.set(key, entry);
}
const mode = list => [...list.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1])[0][0];
let anchors = [...bySize.values()].filter(e => e.Standard.length).map(e => ({ area: e.area, price: mode(e.Standard), weight: e.Standard.length }))
  .sort((a, b) => a.area - b.area);

// --- weighted isotonic regression (pool adjacent violators) → never-decreasing price by area
const blocks = [];
for (const a of anchors) {
  blocks.push({ areas: [a.area], price: a.price, weight: a.weight });
  while (blocks.length > 1 && blocks.at(-2).price > blocks.at(-1).price) {
    const b = blocks.pop(), p = blocks.pop();
    blocks.push({ areas: [...p.areas, ...b.areas], price: (p.price * p.weight + b.price * b.weight) / (p.weight + b.weight), weight: p.weight + b.weight });
  }
}
const curve = blocks.flatMap(b => b.areas.map(area => ({ area, price: b.price })));
const standardFor = area => {
  if (area <= curve[0].area) return curve[0].price;
  for (let i = 1; i < curve.length; i++) {
    const [a, b] = [curve[i - 1], curve[i]];
    if (area <= b.area) return a.price + (b.price - a.price) * (area - a.area) / (b.area - a.area);
  }
  const [a, b] = curve.slice(-2);
  return b.price + (b.price - a.price) / (b.area - a.area) * (area - b.area);
};

const ref = bySize.get('150x150');
const outdoorRatio = mode(ref.Outdoor) / mode(ref.Standard);
const vndPerUsd = products.reduce((s, p) => s + p.prices.VND / p.prices.USD, 0) / products.length;

// --- CSV in/out
function parseCSV(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c; }
    else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(cell => cell.trim()));
}
const [header, ...rows] = parseCSV(readFileSync(templatePath, 'utf8').replace(/^﻿/, ''));
const col = name => header.indexOf(name);
const [iSize, iEdition, iVND, iUSD, iNote] = ['size', 'edition', 'price_vnd', 'price_usd', 'note'].map(col);
let estimated = 0, skus = 0;
for (const r of rows) {
  if (r[iVND]?.trim()) continue;
  const [w, h] = r[iSize].match(/\d+(?:\.\d+)?/g).map(Number);
  const standard = Math.round(standardFor(w * h / 100) / 1000) * 1000;
  const vnd = r[iEdition] === 'Outdoor' ? Math.round(standard * outdoorRatio / 10000) * 10000 : standard;
  r[iVND] = String(vnd);
  r[iUSD] = (Math.round(vnd / vndPerUsd * 100) / 100).toFixed(2);
  r[iNote] = 'ESTIMATE from website prices (area-based) - replace with official price';
  estimated++; skus += Number(r[header.indexOf('new_sku_count')]) || 0;
}
const quote = v => /[",;\n]/.test(String(v)) ? `"${String(v).replaceAll('"', '""')}"` : String(v);
writeFileSync(outPath, '﻿' + [header, ...rows].map(r => r.map(quote).join(',')).join('\r\n') + '\r\n');
console.log(`Standard curve (cm² → ₫): ${curve.map(c => `${c.area}→${Math.round(c.price).toLocaleString('en')}`).join(', ')}`);
console.log(`Outdoor ratio ${outdoorRatio.toFixed(2)} · ${vndPerUsd.toFixed(0)} ₫/USD`);
console.log(`estimated ${estimated} rows (${skus} SKUs) → ${outPath}`);
