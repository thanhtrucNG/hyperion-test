// Writes the official prices from the Odoo product export into the price list (one row per size × edition),
// replacing the ESTIMATE rows. Then re-run build-catalogue-data.mjs to apply them to the site.
//
//   node scripts/import-odoo-prices.mjs --xlsx <Odoo export .xlsx> [--csv docs/price-list-new-skus.csv] [--dry-run]
//
// Each Odoo row is matched to its website SKU by barcode, which gives the size and edition.
// Stops if one size × edition gets two different prices, or a price-list row gets none.
// USD — VND ÷ the site's current rate (VND/USD of the original, hand-maintained SKUs), 2 decimals.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { basename, join } from 'node:path';
import { createRequire } from 'node:module';

const repo = fileURLToPath(new URL('..', import.meta.url));
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a === '--dry-run') args.dryRun = true;
  else if (a.startsWith('--')) args[a.slice(2)] = process.argv[++i];
}
if (!args.xlsx) {
  console.error('Usage: node scripts/import-odoo-prices.mjs --xlsx <file> [--csv docs/price-list-new-skus.csv] [--dry-run]');
  process.exit(1);
}
const csvPath = args.csv ?? join(repo, 'docs', 'price-list-new-skus.csv');
const catalogueDir = 'C:/Users/Latitude 5410/Documents/leadpage/IMO-Signs/hyperion-catalogue';
const XLSX = createRequire(join(catalogueDir, 'package.json'))('xlsx');

const products = JSON.parse(readFileSync(join(repo, 'src', 'data', 'products.json'), 'utf8'));
const byBarcode = new Map(products.map(p => [p.barcode, p]));
const sizeKey = (a, b) => [a, b].sort((x, y) => x - y).join('x');

// --- Odoo export → one price per size × edition
const workbook = XLSX.readFile(args.xlsx);
const rows = XLSX.utils.sheet_to_json(workbook.Sheets['New products'] ?? workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
const priceColumn = Object.keys(rows[0] ?? {}).find(k => k.trim() === 'Sales Price');
if (!priceColumn) throw new Error('No "Sales Price" column in the Odoo export');

const problems = [], odooBarcodes = new Set(), prices = new Map();
for (const r of rows) {
  const barcode = String(r.Barcode).trim(), reference = String(r['Internal Reference']).trim();
  const vnd = typeof r[priceColumn] === 'number' ? r[priceColumn] : Number(String(r[priceColumn]).replace(/[^\d]/g, ''));
  const sku = byBarcode.get(barcode);
  if (!sku) { problems.push(`${reference} (${barcode}): not on the website`); continue; }
  if (!Number.isSafeInteger(vnd) || vnd <= 0) { problems.push(`${reference}: invalid price "${r[priceColumn]}"`); continue; }
  odooBarcodes.add(barcode);
  const key = `${sizeKey(sku.dimensions.first_mm, sku.dimensions.second_mm)}|${sku.edition}`;
  const entry = prices.get(key) ?? prices.set(key, new Map()).get(key);
  entry.set(vnd, [...(entry.get(vnd) ?? []), reference]);
}
for (const [key, entry] of prices) {
  if (entry.size > 1) problems.push(`${key.replace('|', ' ')} has ${entry.size} prices: ${[...entry].map(([v, refs]) => `${v.toLocaleString('en')} (${refs.length} SKUs, e.g. ${refs[0]})`).join(' / ')}`);
}

const originals = products.filter(p => !odooBarcodes.has(p.barcode) && p.prices);
const vndPerUsd = originals.reduce((s, p) => s + p.prices.VND / p.prices.USD, 0) / originals.length;

// --- CSV in/out (same format as estimate-prices.mjs)
function parseCSV(text) {
  const out = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c; }
    else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); out.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); out.push(row); }
  return out.filter(r => r.some(cell => cell.trim()));
}
const [header, ...csvRows] = parseCSV(readFileSync(csvPath, 'utf8').replace(/^﻿/, ''));
const [iSize, iEdition, iVND, iUSD, iNote] = ['size', 'edition', 'price_vnd', 'price_usd', 'note'].map(name => header.indexOf(name));

let changed = 0;
const source = basename(args.xlsx);
for (const r of csvRows) {
  const [w, h] = r[iSize].match(/\d+(?:\.\d+)?/g).map(Number);
  const key = `${sizeKey(w, h)}|${r[iEdition].trim()}`;
  const entry = prices.get(key);
  if (!entry) { problems.push(`Price list row "${r[iSize]} ${r[iEdition]}" has no price in the Odoo export`); continue; }
  const vnd = [...entry.keys()][0];
  if (String(vnd) !== r[iVND]) {
    console.log(`${r[iSize].padEnd(16)} ${r[iEdition].padEnd(9)} ${Number(r[iVND]).toLocaleString('en').padStart(10)} → ${vnd.toLocaleString('en').padStart(10)} ₫`);
    changed++;
  }
  r[iVND] = String(vnd);
  r[iUSD] = (Math.round(vnd / vndPerUsd * 100) / 100).toFixed(2);
  r[iNote] = `official price from ${source}`;
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s) — nothing written:\n  ` + problems.join('\n  '));
  process.exit(1);
}
const quote = v => /[",;\n]/.test(String(v)) ? `"${String(v).replaceAll('"', '""')}"` : String(v);
if (!args.dryRun) writeFileSync(csvPath, '﻿' + [header, ...csvRows].map(r => r.map(quote).join(',')).join('\r\n') + '\r\n');
console.log(`\n${rows.length} Odoo rows · ${csvRows.length} price rows · ${changed} changed · ${vndPerUsd.toFixed(0)} ₫/USD${args.dryRun ? ' (dry run, nothing written)' : ` → ${csvPath}`}`);
