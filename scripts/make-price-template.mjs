// Builds docs/price-template-new-skus.csv: one row per size × edition used by the catalogue's new SKUs.
// Rows whose size the website already sells are pre-filled with today's website price (same size in either orientation).
// Usage: node scripts/make-price-template.mjs <path to hyperion-catalogue folder>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const catalogueDir = process.argv[2];
if (!catalogueDir) throw new Error('Pass the hyperion-catalogue folder path.');
const repo = new URL('..', import.meta.url);
const newSkus = JSON.parse(readFileSync(join(catalogueDir, 'data', 'new-skus.json'), 'utf8'));
const products = JSON.parse(readFileSync(new URL('src/data/products.json', repo), 'utf8'));

// "150x200mm" / "150 × 200 mm" → [150, 200]
export const parseSize = text => {
  const m = String(text).match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  return m ? [Number(m[1]), Number(m[2])] : null;
};
const sizeKey = ([a, b]) => [a, b].sort((x, y) => x - y).join('x');
const display = ([a, b]) => `${a} × ${b} mm`;

// Current website prices by size (orientation-free) and edition → most common price.
const known = new Map();
for (const p of products) {
  const key = `${sizeKey([p.dimensions.first_mm, p.dimensions.second_mm])}|${p.edition}`;
  const tally = known.get(key) ?? new Map();
  const price = `${p.prices.VND}|${p.prices.USD}`;
  tally.set(price, (tally.get(price) ?? 0) + 1);
  known.set(key, tally);
}

const rows = new Map();
for (const sku of newSkus) {
  const size = parseSize(sku.Description.match(/size: ([^,]+)/)?.[1] ?? sku.Name);
  if (!size) throw new Error(`No size for ${sku['Internal Reference']}`);
  const edition = sku['Internal Reference'].includes('.OUTDOOR') ? 'Outdoor' : 'Standard';
  const key = `${display(size)}|${edition}`;
  const row = rows.get(key) ?? { size: display(size), edition, count: 0, categories: new Set(), example: sku.Name.replace(/^Handyman Hyperion (?:IMO )?Safety (?:Sign|Poster|Tie Tag) /, '').replace(/ IMPA.*$/, '').replace(/ \d+x\d+mm.*$/, ''), sizeKey: sizeKey(size) };
  row.count++; row.categories.add(sku.Category);
  rows.set(key, row);
}

const csv = [['size', 'edition', 'new_sku_count', 'categories', 'example_design', 'price_vnd', 'price_usd', 'note']];
for (const row of [...rows.values()].sort((a, b) => b.count - a.count || a.size.localeCompare(b.size) || a.edition.localeCompare(b.edition))) {
  const tally = known.get(`${row.sizeKey}|${row.edition}`);
  let vnd = '', usd = '', note = 'NEW SIZE - please fill in';
  if (tally) {
    const [top, n] = [...tally].sort((a, b) => b[1] - a[1])[0];
    [vnd, usd] = top.split('|');
    const others = [...tally].length - 1;
    note = `pre-filled from website price for this size (${n} SKUs)${others ? `; ${others} other price(s) also used on the site - check` : ''}`;
  }
  csv.push([row.size, row.edition, row.count, [...row.categories].join('; '), row.example, vnd, usd, note]);
}
const quote = v => /[",;\n]/.test(String(v)) ? `"${String(v).replaceAll('"', '""')}"` : String(v);
const out = new URL('docs/price-template-new-skus.csv', repo);
writeFileSync(out, '﻿' + csv.map(r => r.map(quote).join(',')).join('\r\n') + '\r\n');
const filled = csv.slice(1).filter(r => r[5]);
console.log(`rows: ${csv.length - 1} (size × edition), pre-filled: ${filled.length} rows covering ${filled.reduce((s, r) => s + r[2], 0)} SKUs, to fill: ${csv.length - 1 - filled.length} rows covering ${csv.slice(1).filter(r => !r[5]).reduce((s, r) => s + r[2], 0)} SKUs`);
