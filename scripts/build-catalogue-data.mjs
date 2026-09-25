// Merges the IMO catalogue build's new SKUs into the website data (src/data/*.json).
//
//   node scripts/build-catalogue-data.mjs --catalogue <hyperion-catalogue folder> --prices <price CSV>
//        [--images <base URL or ./path>] [--odoo <Odoo import folder>] [--out <folder, default src/data>] [--dry-run]
//
// Sources (from the hyperion-catalogue build, same run as Hyperion_Catalogue_Master.xlsx):
//   data/catalogue.json   design → size → Standard/Outdoor SKU tree, 14 categories
//   data/new-skus.json    the "New codes to import" rows (names, IMPA/ISSA text)
//   input/names-vi.tsv    English design name → Vietnamese name
// Prices come from the filled price template (docs/price-template-new-skus.csv): one row per size × edition.
//
// The 308 SKUs already on the site are kept as they are (matched by barcode); only fields the site never reads
// (and the private purchase cost) are removed. The build stops with a list if anything is missing.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- arguments ----------
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, arg, i, all) => {
  if (arg.startsWith('--')) pairs.push([arg.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return pairs;
}, []));
const repo = fileURLToPath(new URL('..', import.meta.url));
const catalogueDir = args.catalogue;
if (!catalogueDir || !args.prices) {
  console.error('Usage: node scripts/build-catalogue-data.mjs --catalogue <folder> --prices <csv> [--images <base URL>] [--out <folder>] [--dry-run]');
  process.exit(2);
}
const outDir = resolve(args.out ?? join(repo, 'src', 'data'));
const imageBase = typeof args.images === 'string' ? args.images.replace(/\/+$/, '') : '';
const dryRun = Boolean(args['dry-run']);

const readJSON = path => JSON.parse(readFileSync(path, 'utf8').replace(/^﻿/, ''));
const dataDir = join(repo, 'src', 'data');
const current = {
  products: readJSON(join(dataDir, 'products.json')),
  families: readJSON(join(dataDir, 'families.json')),
  taxonomy: readJSON(join(dataDir, 'taxonomy.json')),
  configurator: readJSON(join(dataDir, 'configurator.json')),
};
const catalogue = readJSON(join(catalogueDir, 'data', 'catalogue.json'));
const newSkuRows = new Map(readJSON(join(catalogueDir, 'data', 'new-skus.json')).map(row => [row.Barcode, row]));

// Re-runnable: anything a previous run generated from the catalogue is removed first and rebuilt, so the
// "existing" site data is always the original hand-maintained SKUs (price updates just re-run this script).
{
  const generated = id => newSkuRows.has(id);
  current.products = current.products.filter(p => !generated(p.id));
  current.families = current.families.filter(f => !f.sku_ids.some(generated));
  const keptFamilies = new Set(current.families.map(f => f.product_family_id));
  current.configurator = {
    ...current.configurator,
    families: current.configurator.families.filter(m => keptFamilies.has(m.product_family_id)),
    concepts: current.configurator.concepts.map(c => ({ ...c, family_ids: c.family_ids.filter(id => keptFamilies.has(id)) })).filter(c => c.family_ids.length),
  };
}

// ---------- helpers ----------
const problems = [];
const slug = text => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const parseSize = text => {
  const m = String(text).match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  return m ? [Number(m[1]), Number(m[2])] : null;
};
const sizeDisplay = ([a, b]) => `${a} × ${b} mm`;
const sizeCompact = ([a, b]) => `${a}x${b}mm`;
const impaDigits = code => String(code ?? '').replace(/\D/g, '');

// Vietnamese design names
const namesVi = new Map();
for (const line of readFileSync(join(catalogueDir, 'input', 'names-vi.tsv'), 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
  const [en, vi] = line.split('\t');
  if (en?.trim() && vi?.trim()) namesVi.set(en.trim().toLowerCase(), vi.trim());
}
// Gaps in names-vi.tsv are filled from this repo's reviewed list (never overrides the catalogue's own names).
const namesViExtra = [];
for (const line of readFileSync(join(repo, 'scripts', 'catalogue-names-vi-extra.tsv'), 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
  if (line.startsWith('#')) continue;
  const [en, vi] = line.split('\t');
  if (en?.trim() && vi?.trim() && !namesVi.has(en.trim().toLowerCase())) { namesVi.set(en.trim().toLowerCase(), vi.trim()); namesViExtra.push(`${en.trim()} → ${vi.trim()}`); }
}

// Price list (CSV exported from the template; "size" like "150 × 150 mm", edition Standard/Outdoor)
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
const [header, ...priceRows] = parseCSV(readFileSync(args.prices, 'utf8').replace(/^﻿/, ''));
const col = name => header.findIndex(h => h.trim().toLowerCase() === name);
const [iSize, iEdition, iVND, iUSD] = ['size', 'edition', 'price_vnd', 'price_usd'].map(col);
if ([iSize, iEdition, iVND, iUSD].includes(-1)) throw new Error('Price CSV needs columns: size, edition, price_vnd, price_usd');
const prices = new Map();
const priceKey = (dims, edition) => `${[...dims].sort((a, b) => a - b).join("x")}|${edition}`;
for (const r of priceRows) {
  const size = parseSize(r[iSize]);
  const vnd = Number(String(r[iVND]).replace(/[^\d.]/g, '')), usd = Number(String(r[iUSD]).replace(/[^\d.]/g, ''));
  if (!size || !r[iVND]?.trim() || !r[iUSD]?.trim()) continue;
  if (!Number.isSafeInteger(vnd) || vnd <= 0 || !(usd > 0)) { problems.push(`Price row "${r[iSize]} ${r[iEdition]}": invalid price ${r[iVND]} / ${r[iUSD]}`); continue; }
  // Orientation-free: 150 × 400 and 400 × 150 are the same sign size and price.
  const key = priceKey(size, r[iEdition].trim()), price = { VND: vnd, USD: Math.round(usd * 100) / 100 };
  if (prices.has(key) && JSON.stringify(prices.get(key)) !== JSON.stringify(price)) problems.push(`Price list gives ${r[iSize]} ${r[iEdition]} two different prices (check both orientations)`);
  prices.set(key, price);
}

// ---------- optional: Odoo import files (the records the shop's back office actually holds) ----------
// --odoo <folder with Hyperion_New_Products_*.xlsx>: sizes follow Odoo's orientation (e.g. 100x300, like the
// existing site products), "(Type B)" design names follow Odoo, and SKUs present on only one side are reported.
const odoo = new Map();
if (typeof args.odoo === 'string') {
  const { createRequire } = await import('node:module');
  const XLSX = createRequire(join(catalogueDir, 'package.json'))('xlsx');
  const { readdirSync } = await import('node:fs');
  for (const file of readdirSync(args.odoo).filter(f => /\.xlsx$/i.test(f)).sort()) {
    const wb = XLSX.read(readFileSync(join(args.odoo, file)));
    for (const row of XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' })) {
      const size = parseSize(String(row.Description).match(/size: ([^,]+)/i)?.[1] ?? row.Name);
      odoo.set(String(row.Barcode).trim(), { ref: row['Internal Reference'], size, typeB: /\(Type B\)/i.test(row.Name) });
    }
  }
}
const odooSize = barcode => odoo.get(barcode)?.size ?? null;
const typeBSuffix = (barcodes, lang) => barcodes.some(b => odoo.get(b)?.typeB) ? (lang === 'vi' ? ' (Kiểu B)' : ' (Type B)') : '';

// ---------- existing data ----------
// Fields the site never reads (0 references in src/) — and the private purchase cost — are not published.
const DROP = ['cost', 'sale_price', 'currency_symbols', 'quantity_on_hand', 'description_en', 'description_vi', 'manufacturer',
  'data_status', 'review_note', 'taxonomy_mapping_method', 'taxonomy_confidence', 'dimensions_source',
  'customer_category_en', 'customer_category_vi', 'category_order', 'product_concept_en', 'product_concept_vi', 'source'];
const strip = record => Object.fromEntries(Object.entries(record).filter(([key]) => !DROP.includes(key)));

const products = current.products.map(strip);
const families = current.families.map(strip);
const existingBarcodes = new Set(products.map(p => p.id));
const familyOfBarcode = new Map(families.flatMap(f => f.sku_ids.map(id => [id, f.product_family_id])));
const conceptOfFamily = new Map(current.configurator.families.map(f => [f.product_family_id, f.config_concept]));
const concepts = current.configurator.concepts.map(c => ({ ...c, family_ids: [...c.family_ids] }));
const conceptById = new Map(concepts.map(c => [c.id, c]));
const familyMaps = [...current.configurator.families];
const branches = { ...current.configurator.branches };
let familyNumber = Math.max(...families.map(f => Number(f.product_family_id.replace(/\D/g, ''))));
const nextFamilyId = () => `HYP-FAM-${String(++familyNumber).padStart(3, '0')}`;

// ---------- categories (catalogue order) ----------
const CATEGORY_VI = {
  'Lifesaving Signs (LSS/LSA)': 'Biển báo cứu sinh',
  'Means of Escape Signs (MES)': 'Biển báo thoát hiểm',
  'Emergency Equipment Signs (EES)': 'Biển báo thiết bị khẩn cấp',
  'Fire-Fighting Equipment Signs (FES / FFE)': 'Biển báo thiết bị chữa cháy',
  'Fire-Fighting Control Symbols (FCS)': 'Ký hiệu kiểm soát chữa cháy',
  'Mandatory Signs (MSS)': 'Biển báo bắt buộc',
  'General Shipboard / Port & Leisure Signs': 'Biển báo chung trên tàu / cảng & khu vực dịch vụ',
  'Temporary Tie Tags': 'Thẻ treo cảnh báo tạm thời',
  'Marine Terminal & Airport Signs (ICAO 9363)': 'Biển báo cảng biển & sân bay (ICAO 9363)',
  'Combination Signs': 'Biển báo kết hợp',
  'Prohibition Signs (PSS)': 'Biển báo cấm',
  'Warning Signs (WSS)': 'Biển báo cảnh báo',
  'Hazard Signs': 'Biển báo hàng nguy hiểm',
  'Safety Posters': 'Áp phích an toàn',
};
const NEW_BRANCH = ['customer_category_id', 'config_concept', 'dimensions_display', 'product_family_id', 'edition'];
const existingGroups = new Map(current.taxonomy.groups.map(g => [g.label_en, g]));
const groups = catalogue.map((category, index) => {
  const existing = existingGroups.get(category.title);
  const id = existing?.id ?? slug(category.title);
  if (!CATEGORY_VI[category.title] && !existing) problems.push(`Category "${category.title}" has no Vietnamese label`);
  if (!branches[id]) branches[id] = NEW_BRANCH;
  return { id, label_en: category.title, label_vi: CATEGORY_VI[category.title] ?? existing?.label_vi ?? category.title, order: index + 1 };
});
const groupByCatalogueId = new Map(catalogue.map((category, i) => [category.id, groups[i]]));

// ---------- new SKUs ----------
let added = 0, addedFamilies = 0, addedConcepts = 0;
const missingVi = new Set(), missingPrice = new Map();
for (const category of catalogue) {
  const group = groupByCatalogueId.get(category.id);
  for (const item of category.items) {
    const itemBarcodes = item.sizes.flatMap(s => s.skus.map(k => k.barcode));
    const nameEn = item.name.trim() + typeBSuffix(itemBarcodes, 'en');
    const baseVi = namesVi.get(item.name.trim().toLowerCase());
    const nameVi = baseVi ? baseVi + typeBSuffix(itemBarcodes, 'vi') : undefined;
    // Concept: reuse the concept of any existing SKU of this design, otherwise one concept per design.
    const existingFamily = item.sizes.flatMap(s => s.skus).map(s => familyOfBarcode.get(s.barcode)).find(Boolean);
    let conceptId = existingFamily ? conceptOfFamily.get(existingFamily) : null;
    for (const size of item.sizes) {
      const fresh = size.skus.filter(s => s.status === 'New' && !existingBarcodes.has(s.barcode));
      if (!fresh.length) continue;
      if (size.skus.some(s => existingBarcodes.has(s.barcode))) { problems.push(`${item.id} ${size.size}: mixes website SKUs and new SKUs in one size — not merged`); continue; }
      const dims = odooSize((size.skus.find(s => s.edition === 'Standard') ?? size.skus[0]).barcode) ?? parseSize(size.size);
      if (!dims) { problems.push(`${item.id}: unreadable size "${size.size}"`); continue; }
      const standard = fresh.find(s => s.edition === 'Standard'), outdoor = fresh.find(s => s.edition === 'Outdoor');
      if (!standard || !outdoor) problems.push(`${item.id} ${size.size}: needs both Standard and Outdoor`);
      if (!nameVi) missingVi.add(`${category.title} · ${nameEn}`);
      if (!conceptId) {
        conceptId = `${group.id}:${nameEn}`;
        if (conceptById.has(conceptId)) conceptId = `${group.id}:${nameEn} (${item.id})`;
        const concept = { id: conceptId, category_id: group.id, label_en: nameEn, label_vi: nameVi ?? nameEn, labels_vi: [nameVi ?? nameEn], family_ids: [] };
        concepts.push(concept); conceptById.set(conceptId, concept); addedConcepts++;
      }
      const familyId = nextFamilyId(); addedFamilies++;
      const impa = impaDigits(item.impa);
      const imageUrl = imageBase && standard ? `${imageBase}/${encodeURIComponent(standard.ref)}.jpg` : '';
      const shared = {
        product_family_id: familyId, display_name_en: nameEn, display_name_vi: nameVi ?? nameEn, direction: '',
        impa_code: impa, issa_code: item.issa ?? '', size: sizeCompact(dims),
        dimensions: { first_mm: dims[0], second_mm: dims[1] }, dimensions_display: sizeDisplay(dims),
      };
      families.push({ ...shared, id: familyId, sku_ids: fresh.map(s => s.barcode), image_url: imageUrl, customer_category_id: group.id });
      conceptById.get(conceptId).family_ids.push(familyId);
      familyMaps.push({ product_family_id: familyId, config_concept: conceptId, config_direction: 'unspecified' });
      for (const sku of fresh) {
        const row = newSkuRows.get(sku.barcode);
        if (!row) problems.push(`${sku.barcode}: not in new-skus.json`);
        const price = prices.get(priceKey(dims, sku.edition));
        if (!price) missingPrice.set(`${sizeDisplay(dims)}|${sku.edition}`, (missingPrice.get(`${sizeDisplay(dims)}|${sku.edition}`) ?? 0) + 1);
        const outdoorVi = sku.edition === 'Outdoor' ? ' (Phiên bản ngoài trời)' : '';
        const nameLine = row?.Name ?? `Handyman Hyperion IMO Safety Sign ${nameEn}${impa ? ` IMPA ${impa}` : ''} ${sizeCompact(dims)}`;
        products.push({
          ...shared,
          id: sku.barcode, barcode: sku.barcode, internal_reference: sku.ref,
          original_name_en: nameLine,
          original_name_vi: `${nameLine} / Handyman Hyperion - Biển báo an toàn IMO ${nameVi ?? nameEn}${impa ? ` IMPA ${impa}` : ''} ${sizeCompact(dims)}${outdoorVi}`,
          edition: sku.edition, currency: 'VND', prices: price ?? null,
          unit: row?.Unit ?? 'set (s)', origin: row?.Origin ?? 'Vietnam', image_url: imageUrl, customer_category_id: group.id,
        });
        existingBarcodes.add(sku.barcode); added++;
      }
    }
  }
}

// ---------- spreadsheet rows the catalogue tree did not place ----------
// The spreadsheet ("New codes to import") is the authority on which SKUs exist. A row can be missing from the
// catalogue tree when the printed catalogue shows one design under two categories with shared codes, while the
// spreadsheet gives the second listing its own "-B" codes (e.g. Disabled access, Airport). Group such rows by
// category + design + size into their own family.
const leftover = new Map();
for (const row of newSkuRows.values()) {
  if (existingBarcodes.has(row.Barcode)) continue;
  const group = groups.find(g => g.label_en === row.Category);
  const dims = odooSize(row.Barcode) ?? parseSize(row.Description.match(/size: ([^,]+)/)?.[1] ?? row.Name);
  const nameEn = row.Name.replace(/^Handyman Hyperion (?:IMO )?Safety (?:Sign|Poster|Tie Tag) /, '').replace(/\s*,\s*outdoor edition$/i, '')
    .replace(/ IMPA \d+.*$/, '').replace(/ \d+x\d+mm.*$/, '').trim();
  if (!group || !dims) { problems.push(`${row.Barcode}: cannot place (category "${row.Category}")`); continue; }
  const key = `${group.id}|${nameEn}|${sizeDisplay(dims)}`;
  const entry = leftover.get(key) ?? { group, nameEn, dims, rows: [] };
  entry.rows.push(row); leftover.set(key, entry);
}
for (const { group, nameEn, dims, rows } of leftover.values()) {
  const nameVi = namesVi.get(nameEn.toLowerCase());
  if (!nameVi) missingVi.add(`${group.label_en} · ${nameEn}`);
  const impa = impaDigits(rows[0].Description.match(/IMPA Code: ([\d.]+)/)?.[1]);
  const issa = rows[0].Description.match(/ISSA Code: ([\d.]+)/)?.[1] ?? '';
  let conceptId = `${group.id}:${nameEn}`;
  if (!conceptById.has(conceptId)) {
    const concept = { id: conceptId, category_id: group.id, label_en: nameEn, label_vi: nameVi ?? nameEn, labels_vi: [nameVi ?? nameEn], family_ids: [] };
    concepts.push(concept); conceptById.set(conceptId, concept); addedConcepts++;
  }
  const familyId = nextFamilyId(); addedFamilies++;
  const standardRow = rows.find(r => !r['Internal Reference'].includes('.OUTDOOR'));
  const imageUrl = imageBase && standardRow ? `${imageBase}/${encodeURIComponent(standardRow['Internal Reference'])}.jpg` : '';
  const shared = {
    product_family_id: familyId, display_name_en: nameEn, display_name_vi: nameVi ?? nameEn, direction: '',
    impa_code: impa, issa_code: issa, size: sizeCompact(dims),
    dimensions: { first_mm: dims[0], second_mm: dims[1] }, dimensions_display: sizeDisplay(dims),
  };
  families.push({ ...shared, id: familyId, sku_ids: rows.map(r => r.Barcode), image_url: imageUrl, customer_category_id: group.id });
  conceptById.get(conceptId).family_ids.push(familyId);
  familyMaps.push({ product_family_id: familyId, config_concept: conceptId, config_direction: 'unspecified' });
  if (rows.length !== 2) problems.push(`${nameEn} ${sizeDisplay(dims)} (${group.label_en}): expected Standard + Outdoor, got ${rows.length}`);
  for (const row of rows) {
    const edition = row['Internal Reference'].includes('.OUTDOOR') ? 'Outdoor' : 'Standard';
    const price = prices.get(priceKey(dims, edition));
    if (!price) missingPrice.set(`${sizeDisplay(dims)}|${edition}`, (missingPrice.get(`${sizeDisplay(dims)}|${edition}`) ?? 0) + 1);
    products.push({
      ...shared,
      id: row.Barcode, barcode: row.Barcode, internal_reference: row['Internal Reference'],
      original_name_en: row.Name,
      original_name_vi: `${row.Name} / Handyman Hyperion - Biển báo an toàn IMO ${nameVi ?? nameEn}${impa ? ` IMPA ${impa}` : ''} ${sizeCompact(dims)}${edition === 'Outdoor' ? ' (Phiên bản ngoài trời)' : ''}`,
      edition, currency: 'VND', prices: price ?? null, unit: row.Unit || 'set (s)', origin: row.Origin || 'Vietnam',
      image_url: imageUrl, customer_category_id: group.id,
    });
    existingBarcodes.add(row.Barcode); added++;
  }
}

// ---------- checks ----------
const notAdded = [...newSkuRows.keys()].filter(barcode => !existingBarcodes.has(barcode));
if (notAdded.length) problems.push(`${notAdded.length} spreadsheet SKUs not added: ${notAdded.slice(0, 10).join(', ')}`);
if (missingPrice.size) problems.push(`Missing price for ${[...missingPrice.values()].reduce((a, b) => a + b, 0)} SKUs in ${missingPrice.size} size × edition rows:\n    ` + [...missingPrice].map(([k, n]) => `${k.replace('|', ' · ')} (${n})`).join('\n    '));
if (missingVi.size) problems.push(`Missing Vietnamese name for ${missingVi.size} design(s):\n    ${[...missingVi].join('\n    ')}`);
const ids = products.map(p => p.id), refs = products.map(p => p.internal_reference);
const dup = list => [...new Set(list.filter((v, i) => list.indexOf(v) !== i))];
if (dup(ids).length) problems.push(`Duplicate barcodes: ${dup(ids).slice(0, 10).join(', ')}`);
// Duplicates already in the website data (e.g. Straight Arrow HYPERION33.4420 at two sizes) are reported, not blocking.
const oldRefs = new Set(current.products.map(p => p.internal_reference));
const newDupRefs = dup(refs).filter(ref => refs.filter(r => r === ref).length > current.products.filter(p => p.internal_reference === ref).length);
if (newDupRefs.length) problems.push(`Duplicate internal references involving new SKUs: ${newDupRefs.slice(0, 10).join(', ')}`);
const warnings = [];
const oldDupRefs = dup(refs).filter(ref => oldRefs.has(ref) && !newDupRefs.includes(ref));
if (oldDupRefs.length) warnings.push(`Already duplicated in the website data (unchanged): ${oldDupRefs.join(', ')}`);
if (odoo.size) {
  const generatedIds = products.filter(p => newSkuRows.has(p.id));
  const notInOdoo = generatedIds.filter(p => !odoo.has(p.id));
  const refDiff = generatedIds.filter(p => odoo.has(p.id) && odoo.get(p.id).ref !== p.internal_reference);
  const onSite = new Set(products.map(p => p.id));
  const odooNotOnSite = [...odoo.keys()].filter(id => !onSite.has(id));
  warnings.push(`Odoo check: ${odoo.size} Odoo rows · ${generatedIds.length - notInOdoo.length} matched · refs differing ${refDiff.length} · on site but not in Odoo ${notInOdoo.length}${notInOdoo.length ? ` (${notInOdoo.map(p => `${p.internal_reference} ${p.display_name_en}`).join('; ')})` : ''} · in Odoo but not on site ${odooNotOnSite.length}`);
}
if (namesViExtra.length) warnings.push(`Vietnamese names from scripts/catalogue-names-vi-extra.tsv (need review): ${namesViExtra.join('; ')}`);
const productIds = new Set(ids);
for (const f of families) for (const id of f.sku_ids) if (!productIds.has(id)) problems.push(`${f.product_family_id}: SKU ${id} missing`);
const mappedFamilies = new Set(familyMaps.map(m => m.product_family_id));
for (const p of products) if (!mappedFamilies.has(p.product_family_id)) problems.push(`${p.id}: family ${p.product_family_id} has no configurator mapping`);
for (const p of products) if (!groups.some(g => g.id === p.customer_category_id)) problems.push(`${p.id}: category ${p.customer_category_id} not in taxonomy`);

// Taxonomy counts
for (const g of groups) {
  const fams = families.filter(f => f.customer_category_id === g.id);
  Object.assign(g, { family_count: fams.length, sku_count: products.filter(p => p.customer_category_id === g.id).length, impa_count: new Set(fams.map(f => f.impa_code).filter(Boolean)).size });
}

const summary = [
  `website SKUs kept: ${current.products.length}`, `new SKUs: ${added}`, `total SKUs: ${products.length}`,
  `new families: ${addedFamilies} (total ${families.length})`, `new sign concepts: ${addedConcepts} (total ${concepts.length})`,
  `categories: ${groups.length} — ${groups.map(g => `${g.label_en} ${g.sku_count}`).join(', ')}`,
  `images: ${imageBase ? `${imageBase}/<Standard ref>.jpg` : 'none for new SKUs (shows "Image unavailable")'}`,
];
console.log(summary.join('\n'));
if (warnings.length) console.log(`\nNotes:\n- ${warnings.join('\n- ')}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  if (!dryRun) { console.error('\nNothing written. Fix the problems above (or run with --dry-run to inspect).'); process.exit(1); }
}

// ---------- write ----------
const out = {
  'products.json': products,
  'families.json': families,
  'taxonomy.json': { ...current.taxonomy, groups },
  'configurator.json': { ...current.configurator, branches, concepts, families: familyMaps },
};
mkdirSync(outDir, { recursive: true });
let bytes = 0;
for (const [name, value] of Object.entries(out)) {
  const text = JSON.stringify(value, null, name === 'products.json' || name === 'families.json' ? 0 : 2);
  writeFileSync(join(outDir, name), text + '\n');
  bytes += Buffer.byteLength(text);
}
console.log(`\nwrote ${Object.keys(out).length} files to ${outDir} — ${(bytes / 1024 / 1024).toFixed(2)} MB total${dryRun && problems.length ? ' (DRY RUN with problems — not for the live site)' : ''}`);
