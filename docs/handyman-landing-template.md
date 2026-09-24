# Handyman Product Landing Page — Template Specification

**Reference implementation:** HYPERION Marine Safety Signs (this repository)
**Audience:** AI agents and developers building a sales landing page for another Handyman product
**Status:** Standard v1 — every value in this document is fixed. Where a range is not given, none is allowed.

---

## 0. How an agent must use this document

1. **Copy, don't redesign.** The layout, components, checkout flow and theme are reused as-is. A new product changes only the *inputs* listed in §2.
2. **Every number is fixed.** Use the exact px values in this document. Do not pick "something between X and Y", do not use `clamp()`, `vw`-based font sizes or ad-hoc values. If a value you need is missing, use the nearest token from §5/§6 and flag it in your hand-off note — do not invent a new one.
3. **MUST / MUST NOT** are hard rules. **SHOULD** allows an exception only with a written reason in the hand-off note.
4. **Only use images supplied for this product** (§4). Never fetch, generate or borrow images.
5. **Before handing off, run the checklist in §15** and report the result of each item.

---

## 1. Page anatomy (fixed section order)

Every product site has exactly these sections, in this order. Do not add, remove or reorder sections without approval.

| # | Section | Background | Purpose (what the user decides here) |
|---|---|---|---|
| 1 | **Header** (sticky) | Light — sky asset | Where to go; language; contact sales |
| 2 | **Hero** | Dark — hero photo + navy overlay | "Is this the product I need?" → start ordering or get catalogue |
| 3 | **Feature section** ("Built for…") | Light — misty-sea asset | "Is it good enough / compliant?" |
| 3b | **Product range** strip — *optional*, only if the brief includes it | Light — plain page colour | "What else is in this range?" (auto-sliding strip, §11.2) |
| 4 | **Shop section**: Product search + Configurator steps + Order summary | Light — plain page colour | Find the exact item, configure, pay |
| 5 | **Footer** | Dark — ocean asset | Who is the company; how to reach them |

**Light/dark rhythm rule:** header light → hero dark → feature light → shop light → footer dark. Two dark sections MUST NOT be adjacent. If a product needs a second feature section, it MUST be light and placed between §3 and §4.

### 1.1 Section contents (fixed components)

**Header**
- Left: Handyman logo (`assets/handyman-logo.png`, links to `./`).
- Right, in order: nav links `PRODUCT LOOKUP` (→ `#product-query`), `ORDER` (→ `#find-your-sign`) — both glide per §11.1, `CATALOGUE` (downloads the product PDF) · language switch `EN | VI` · `CONTACT SALES` button (opens contact modal).
- Below 1024px: nav links + Contact Sales collapse into a `Menu` button dropdown; language switch stays visible.

**Hero**
- Eyebrow: `<PRODUCT> BY HANDYMAN` (uppercase).
- H1, two lines: line 1 = product category in plain words (white), line 2 = benefit/use case (light blue `#c7ddea`). Max 12 words total.
- Two buttons: primary `FIND YOUR SIGN` → glides to configurator (§11.1); secondary `DOWNLOAD CATALOGUE` → product PDF. Rename "sign" to the product noun (e.g. `FIND YOUR TOOL`). Button text is always uppercase (§5.3).
- No paragraph text, no statistics, no product thumbnails in the hero.
- *Optional:* one **rotating product image** on the right half (desktop/tablet only; hidden below 768px). It shows 3–5 images from the product folder and follows §11.2.

**Product range strip** (*optional*)
- H2 `PRODUCT RANGE` / `DÒNG SẢN PHẨM` + one horizontal strip of product cards (image 1:1, name, one meta line). Cards link to the configurator with that product preselected.
- Motion rules: §11.2.

**Feature section**
- Image column: one product "hero visual" (cut-out or exploded view) — see §4.
- Text column: eyebrow → H2 (max 6 words) → intro (max 30 words) → **exactly 4** feature cards in a 2×2 grid (icon + title max 4 words + body max 14 words) → text link `View Catalogue →`.

**Shop section**
- Left column: Product search card, then configurator heading `FIND YOUR <PRODUCT> <NOUN>` + `Reset selection`, then numbered steps.
- Steps: `1 Choose a product category` → product-specific steps from `configurator.json` → `Contact & Shipping` → `Payment`. The last two are always the final two steps.
- Right column (desktop/tablet): sticky Order Summary card. Mobile: bottom bar (hidden until the order has ≥1 item) that opens the summary as a sheet.

**Footer** — fixed copy, see §10.

---

## 2. Per-product input package (what the human provides)

An agent MUST refuse to start until items marked **Required** exist in the project folder. List anything missing in the hand-off note.

| Item | Location | Required | Spec |
|---|---|---|---|
| Product name (brand) | brief | Required | e.g. `HYPERION` — uppercase in eyebrow/footer title |
| Product noun (EN/VI) | brief | Required | e.g. "sign / biển báo" — used in CTAs and headings |
| Hero headline (EN + VI, 2 lines) | brief | Required | ≤ 12 words |
| Feature section copy (EN + VI) | brief | Required | eyebrow, H2, intro, 4 × (title, body) |
| Hero photo | `src/assets/products/<slug>/hero.jpg` | Required | see §4.2 |
| Feature visual | `src/assets/products/<slug>/feature-visual.webp` | Required | see §4.2 |
| Product catalogue PDF | `assets/<slug>-catalogue-en.pdf` (+ `-vi.pdf` if available) | Required | ≤ 5 MB |
| Product data | `src/data/products.json`, `families.json`, `taxonomy.json`, `configurator.json` | Required | same schema as Hyperion (§12) |
| Product images | URLs inside `products.json` → `image_url`, or files in `src/assets/products/<slug>/items/` | Required | see §4.2 |
| Pricing & deposit | `products.json` prices; `src/checkout/config.js` deposit | Required | USD + VND |
| Page `<title>` + meta description (EN) | brief | Required | title ≤ 60 chars, description ≤ 155 chars |
| Favicon | `favicon.png` | Optional | defaults to Handyman favicon |

---

## 3. Marine theme

### 3.1 Shared theme assets (reuse unchanged for every marine product)

These live in `src/assets/theme/` and `src/assets/sign-construction/`. They are **brand backgrounds**, not content. They MUST NOT be replaced per product, cropped into content images, or used anywhere other than the slot below.

| File | Size | Slot | CSS (fixed) |
|---|---|---|---|
| `hyperion-header-sky.png` | 2048×682 | Header background | `background: #eef8ff url(sky) center / cover;` + overlay `linear-gradient(rgba(255,255,255,.12), rgba(255,255,255,.12))`; bottom border `2px solid #e63720` |
| `hyperion-hero-ship.png` | 2017×780 | Hero background (Hyperion only — other products supply their own hero photo, §4) | see §3.3 |
| `sign-construction-bg.png` | 1672×941 | Light feature-section background | `background: #f8fbfe url(bg) center bottom / cover no-repeat;` |
| `hyperion-order-summary.png` | 1448×1086 | Order Summary card (desktop) | `center / cover`, overlay per §3.3 |
| `hyperion-order-summary-tall.png` | 1122×1402 | Order Summary sheet (mobile) | `center / cover` + `linear-gradient(rgba(4,37,60,.34), rgba(4,37,60,.25))` |
| `hyperion-footer-ocean.png` | 2048×682 | Footer background | see §3.3 |

> **Rename note:** when the template is extracted, rename these to `theme-header-sky`, `theme-feature-sea`, `theme-summary-ocean(-tall)`, `theme-footer-ocean`. Filenames must not carry a product name.

**Asset delivery rules**
- Export every theme background as **WebP, quality 80, ≤ 350 KB** (current PNGs are 1.7–3.5 MB — must be converted). Keep the PNG only as source.
- Dark backgrounds MUST always have the navy overlay; text MUST NOT sit on the raw photo.
- The helm-wheel watermark in the summary/footer images sits on the right — never place text or buttons over the right 20% of those images.
- The oil-rig/sea band in the feature background occupies the bottom 25% — keep cards and text above it (section bottom padding handles this, §6.3).

### 3.2 Colour palette (the only colours allowed)

| Token | Hex | Use |
|---|---|---|
| `--navy-950` | `#06263d` | Dark surfaces, headings on light, primary text on light, dark buttons |
| `--navy-800` | `#0d3a5a` | Hover of dark buttons, secondary dark |
| `--text` | `#092c46` | Body text on light |
| `--muted` | `#60788b` | Secondary text, hints, locked steps |
| `--page` | `#f3f7f9` | Page background |
| `--surface` | `#ffffff` | Cards, inputs |
| `--border` | `#cbd9e3` | Input and option borders |
| `--border-soft` | `#dce6ed` | Card borders, dividers |
| `--red` | `#e63720` | Primary CTA, active step number, accent lines, header/footer border |
| `--red-hover` | `#c92e1b` | Hover of primary CTA |
| `--red-soft` | `#fff2ee` | Selected option background |
| `--coral` | `#ff8a73` | Accent text **on dark** (footer headings, icons) |
| `--sky-text` | `#c7ddea` | Second hero line on dark |
| `--on-dark` | `#ffffff` @ 92% | Body text on dark |
| `--on-dark-muted` | `#ffffff` @ 62% | Secondary text on dark |
| `--success` | `#008548` | "Added" feedback only |

Rules: red is for **one** primary action per view plus thin accent lines — never for body text or large fills. Text contrast MUST be ≥ 4.5:1 (body) and ≥ 3:1 (≥ 20px bold).

### 3.3 Dark-section overlays (fixed values)

| Section | ≥ 768px | < 768px |
|---|---|---|
| Hero | `linear-gradient(90deg, rgba(4,33,53,.86) 0%, rgba(4,33,53,.70) 38%, rgba(4,33,53,.30) 68%, rgba(4,33,53,.08) 100%)` | `linear-gradient(180deg, rgba(4,33,53,.84) 0%, rgba(4,33,53,.74) 100%)` |
| Footer | `linear-gradient(180deg, rgba(3,35,56,.94) 0%, rgba(3,35,56,.89) 55%, rgba(3,35,56,.76) 100%)` | same |
| Order Summary | `linear-gradient(rgba(4,37,60,.34), rgba(4,37,60,.25))` | same |

### 3.4 Shape & depth

- Radius: **8px** cards/steps/modals · **6px** buttons and inputs · **999px** pills/chips · **16px** Order Summary card only.
- Shadow (one only): `0 8px 24px rgb(6 38 61 / 8%)` for cards; Order Summary `0 16px 36px rgb(8 34 56 / 18%)`.
- Borders: 1px. Accent borders (top of search card, top of summary, header bottom, footer top): 3px `--red` (header 2px).
- Icons: 24×24 viewBox, stroke 1.7, round caps/joins, `currentColor`. Displayed at **20px** inline, **24px** in feature cards, inside a 44px circle (`--red-soft` background) for feature cards.

---

## 4. Images

### 4.1 Source rule (hard)

- Images MUST come **only** from the product's own folder `src/assets/products/<slug>/` or the `image_url` values in that product's `products.json` / `families.json`.
- MUST NOT: stock photos, AI-generated images, images from another Handyman product, screenshots, hot-linked web images, placeholder services, emoji or clip-art substitutes.
- If a required image is missing, render the built-in fallback (`Image unavailable` box, same size as the image slot) and list it in the hand-off note. Never substitute.
- Theme backgrounds (§3.1) are the only shared images.

### 4.2 Required image specs

| Slot | Min size | Aspect | Format / weight | Composition rule |
|---|---|---|---|---|
| Hero photo | 2400×900 | 8:3 | WebP/JPG ≤ 400 KB | Subject in the **right 40%**; left 60% calm and darkish for text; horizon/lines not crossing the headline |
| Feature visual | 1400×1050 | 4:3 | WebP with transparency ≤ 300 KB | Product isolated, centred, ≥ 10% empty margin on all sides |
| Product / variant images | 800×800 | 1:1 | WebP/JPG ≤ 120 KB | Product on pure white `#fff`, centred, fills 80–90% |
| Catalogue cover (optional) | 600×850 | A-ratio | WebP ≤ 120 KB | — |
| Logo | 400px wide | — | PNG/SVG transparent | Supplied by Handyman only |

### 4.3 Display rules

- `object-fit: contain` for product images (never crop a product); `cover` only for backgrounds.
- Every `<img>` has `width`/`height` attributes, `loading="lazy"` (except hero/above-the-fold: `eager`), `decoding="async"`.
- `alt` text: product name + variant in the current language (e.g. "Lifebuoy sign, 150 × 150 mm"). Decorative images: `alt=""`.
- Never put text inside images (no baked-in headlines) — all text is HTML so it can be translated.

---

## 5. Typography

### 5.1 Font family (max 2 — standard uses 1)

| Role | Family | Weights loaded |
|---|---|---|
| Everything (UI, headings, body) | **Be Vietnam Pro** | 400, 600, 700 |
| Optional second font | *none by default* — if a product brief requires one, it may only be used for H1/H2 and MUST fully support Vietnamese | 1 weight |

- Load: self-host WOFF2 in `assets/fonts/` with `latin` + `vietnamese` subsets, `font-display: swap`, preload the 400 and 700 files.
- Fallback stack: `'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif`.
- Why: Vietnamese diacritics stack above and below letters (Ể, Ặ, Ữ); the font must draw them without clipping at line-height 1.2. Be Vietnam Pro is designed for this and is free (OFL).
- **Hyperion deviation:** currently uses `'Segoe UI', Arial` (a Windows system font, so Mac/iPhone/Android visitors see Arial/Helvetica). Migrate when the template is extracted.

### 5.2 Font sizes — exactly 5 on the whole site

| Token | Size | Line height | Weight | Used for |
|---|---|---|---|---|
| `--fs-1` | **40px** | 1.2 | 700 | Hero H1 (desktop/tablet) |
| `--fs-2` | **28px** | 1.2 | 700 | Section H2, hero H1 on mobile, Order Summary total |
| `--fs-3` | **20px** | 1.2 | 700 | Card/step titles, footer brand title, prices, section H2 on mobile |
| `--fs-4` | **16px** | 1.5 | 400 / 600 | Body, intro, inputs, option titles, step titles on mobile |
| `--fs-5` | **14px** | 1.5 | 400 / 600 / 700 | Labels, hints, meta (IMPA/size), eyebrows, footer text, captions, errors, **all CTA button and chip text (uppercase, 700)** |

Rules:
- No other size may appear anywhere (including modals, toasts, badges). **Minimum size is 14px** — no 10/11/12/13px text.
- Mobile (< 768px) changes only two things: H1 `40 → 28`, H2 `28 → 20`. Every other element keeps its size.
- Weights: 400 (body), 600 (labels, option titles), 700 (headings, prices, CTA buttons). No 300/500/800/900.
- Letter-spacing: `0` everywhere, except uppercase eyebrows/column headings `0.12em` and CTA buttons `0.04em`.
- Uppercase is allowed only for: **CTA buttons (§5.3)**, eyebrows, footer column headings, header nav links, configurator heading. Never uppercase a sentence, a paragraph or body text.
- Prices, quantities, codes: `font-variant-numeric: tabular-nums`.
- **Hyperion deviation:** the current code uses ~40 distinct font sizes (8px–80px plus many `clamp()` values). The template must be normalised to the 5 tokens above.

### 5.3 CTA buttons — always uppercase

Every call-to-action button shows its text **in capitals**, in both languages.

- **Counts as a CTA:** every element styled as a button that performs an action — primary (red) and secondary (outline/navy) buttons, header `CONTACT SALES`, hero buttons, `FIND PRODUCTS`, `ADD` / `ADD TO ORDER`, `SHOW MORE RESULTS`, Order Summary `ORDER` / `PAY NOW` / `VIEW ORDER`, payment buttons (`PAY BY CARD`, `OPEN SECURE CHECKOUT`, `CHECK PAYMENT STATUS`, `SUBMIT TRANSFER REFERENCE`), contact-sales `SEND REQUEST`, modal `CLOSE`, footer `WHATSAPP` / `ZALO` chips, `RESET SELECTION`.
- **Not a CTA** (keep normal case): selectable option cards (category, sign, size, edition, payment option/method), form labels, text links such as `View Catalogue →`, the `EN | VI` switch, step titles.
- **How:** store the label in normal sentence case in `locale.js` (e.g. `'Find your sign': 'Tìm biển báo'`) and render capitals with CSS `text-transform: uppercase` on the button class. Never type capitals into the translation file for a CTA — this keeps screen-reader output natural and lets one string serve other contexts.
- Style: `--fs-5` 14px, weight 700, letter-spacing `0.04em`, `white-space: nowrap`. Max 3 words (Vietnamese max 4 words). Vietnamese capitals keep all diacritics (`THANH TOÁN NGAY`, `TẢI CATALOGUE`) — check that the font draws stacked marks (Ể, Ặ) without clipping at the 48px button height.

### 5.4 Text display rules (line breaks & wrapping)

1. Headings (H1–H3): `text-wrap: balance`. Paragraphs: `text-wrap: pretty`. This prevents a single orphan word on the last line.
2. Never break inside these units — join them with a non-breaking space (` `) or wrap in `white-space: nowrap`:
   - number + unit: `150 × 150 mm`, `2 units`, `US$5`, `130.000 ₫`
   - phone numbers `(+84) 347 099 905`, emails, IMPA/ISSA codes, barcodes, tax code
   - brand + product: `HYPERION by DLV Corporation` may break only before `by`
3. Company legal names and the footer address MUST render on one line at ≥ 1296px (see §10).
4. Hero H1: the break between line 1 and line 2 is a **forced** break (two elements). Each line MUST NOT itself wrap at ≥ 1024px — shorten the copy if it does.
5. Body line length: max **640px** (`max-width: 640px` on intro paragraphs).
6. No hyphenation (`hyphens: manual`). Vietnamese words break only at spaces. Use `overflow-wrap: anywhere` **only** for codes/URLs inside narrow cards.
7. Buttons and chips never wrap (`white-space: nowrap`); if a label doesn't fit, shorten the label.
8. Placeholder text must fit its input at 360px width without truncation — write a short mobile variant if needed (see Hyperion search box: `IMPA, ISSA, barcode or name`).
9. One H1 per page. Heading levels never skip (H2 → H3).

---

## 6. Layout & spacing (fixed values)

### 6.1 Spacing scale (the only spacing values allowed)

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96` px

### 6.2 Breakpoints (exactly three)

| Name | Width range | Test widths |
|---|---|---|
| Mobile | 0 – 767px | 360, 375, 390, 430 |
| Tablet | 768 – 1023px | 768, 820 |
| Laptop | 1024 – 1279px | 1024, 1180 |
| Desktop | ≥ 1280px | 1280, 1440, 1920 |

Media queries use only `min-width: 768px`, `min-width: 1024px`, `min-width: 1280px` (mobile-first), plus the one footer rule at `min-width: 1296px` (§10). **Hyperion deviation:** ~25 different breakpoints today — normalise.

### 6.3 Page grid

| Value | Mobile | Tablet | Laptop | Desktop |
|---|---|---|---|---|
| Content max width | 100% − gutters | 100% − gutters | 100% − gutters | **1200px**, centred |
| Side gutter | **16px** | **32px** | **32px** | **48px** (min) |
| Header height | **64px** | **72px** | **80px** | **80px** |
| Logo width | **120px** | **140px** | **160px** | **180px** |
| Section padding (top / bottom) | **48 / 48** | **64 / 64** | **96 / 96** | **96 / 96** |
| Hero padding (top / bottom) | **40 / 48** | **48 / 64** | **64 / 64** | **64 / 64** |
| Hero min-height | none | **360px** | **400px** | **400px** |
| Footer padding (top / bottom) | **32 / 16** | **40 / 16** | **40 / 16** | **40 / 16** |

Every section uses the same `.container` so all content aligns to the same left/right edges as the header logo. Full-bleed backgrounds, contained content — always.

### 6.4 Component spacing

| Element | Value |
|---|---|
| Eyebrow → heading | 12px |
| H2 → intro | 16px |
| Intro → content (cards/grid) | 32px (mobile 24px) |
| Card padding | 24px (mobile 16px) |
| Card grid gap | 16px |
| Two-column section gap (image ↔ text) | 64px desktop · 48px laptop · 32px tablet |
| Configurator step padding | 20px (mobile 12px) |
| Gap between steps | 16px |
| Form field gap | 16px; label → input 8px |
| Button | height **48px**, padding 0 24px, gap icon↔text 8px; text 14px / 700 / uppercase / 0.04em (§5.3) |
| Secondary chip / pill | height **32px**, padding 0 12px; text 14px / 700 / uppercase |
| Input | height **48px**, padding 0 12px |
| Minimum touch target | **44 × 44px** |
| Hero H1 → buttons | 32px (mobile 24px) |
| Footer column gap | 28px + 1px divider + 28px |

### 6.5 Shop section layout

| | Mobile | Tablet | Laptop | Desktop |
|---|---|---|---|---|
| Columns | 1 | main + **280px** summary | main + **320px** summary | main + **360px** summary |
| Column gap | — | 16px | 24px | 24px |
| Summary | bottom bar (76px) + sheet | sticky, top = header + 16px | sticky | sticky |
| Search card overlap onto previous section | −24px | −36px | −36px | −36px |

### 6.6 Order steps — one style for every step

All numbered steps (1 → Payment) are the same component and MUST look identical. No step may carry its own font size, badge size, padding, radius or shadow.

| Part | Open step (current / complete) | Locked step |
|---|---|---|
| Container | white card, 1px `--border-soft`, radius 8px, padding 20px (mobile 12px), card shadow | next locked: `#edf3f7` card, padding 8px 20px 12px · later locked: no card, title row only (padding 2px 20px) |
| Step title (legend) | `--fs-3` 20px / 700 (mobile `--fs-4` 16px) | `--fs-4` 16px / 700, `--muted` |
| Number badge | 28 × 28px, radius 4px, `--fs-5` 14px / 700 white; `--red` when current, `--navy-950` when complete | 28 × 28px, `#728596` |
| Sub-heading inside a step (e.g. "Payment option") | `--fs-4` 16px / 700 | — |
| Option title (category, sign, payment choice, method) | `--fs-4` 16px / 600 | — |
| Option detail / hint | `--fs-5` 14px / 400, `--muted` | unlock hint `--fs-5` 14px |
| Price inside a step | `--fs-3` 20px / 700, tabular numbers | — |
| Field label / error | `--fs-5` 14px / 600 · `--fs-5` 14px / 400 red | — |

Rules:
- Step-specific selectors (`#order-payment legend`, `#contact-shipping .step-number`, …) MUST NOT set typography or spacing. They may only set layout of the step's *content* (e.g. grid columns).
- The payment pop-up window (card / bank transfer dialog) is a separate modal, not a step; it uses the modal styles but still only the 5 font-size tokens.
- A step unlocks automatically when the previous step is valid. There is never a "Continue" / "Next" button between steps (§9.3).

---

## 7. Alternating layouts (sections with images)

1. Count only **image + text** sections, top to bottom. Odd ones: **image left, text right**. Even ones: **text left, image right**. (Hyperion has one: image left.)
2. Column ratio is fixed: **image 5/12, text 7/12** (at 1200px: 468px image, 64px gap, 668px text). Vertical alignment: centre.
3. **Symmetrical 6/6** is allowed only when both columns carry equal-weight content (e.g. comparing two editions/materials). Never symmetrical for a single image + copy.
4. Two image sections MUST NOT sit next to each other with the image on the same side.
5. Hero and footer are excluded from the count (they're full-width backgrounds).
6. **Mobile never alternates:** order is always eyebrow → heading → intro → image → cards → link.
7. Image column never shrinks below 320px; below 1024px the section stacks (text first).

---

## 8. Language

- Default language **English**; Vietnamese via `?lang=vi` (EN | VI switch in header). `<html lang>` MUST match.
- Every visible string goes through `t()` in `src/lib/locale.js` and MUST have a Vietnamese entry. No hard-coded UI text in components.
- Product data uses paired fields (`display_name_en` / `display_name_vi`, `label_en` / `label_vi`). Both are required.
- Currency follows language: EN → **USD** (`US$`), VI → **VND** (`₫`, dot thousands separator).
- Do not mix languages in one view, except: product codes (IMPA, ISSA), brand names (HYPERION, WhatsApp, Zalo, Visa), and the company's legal names in the footer (both always shown).
- Vietnamese copy is written, not machine-translated word-for-word; keep the same length ±20% so layouts hold.
- Catalogue link serves `-vi.pdf` when the language is VI and that file exists, otherwise the EN PDF.

### 8.1 EN → VI wording rules

Translate the **meaning in context**, not the words. Before writing a Vietnamese string, ask: *where does it appear, what does the customer do next?*

1. **One concept = one Vietnamese term, everywhere.** Use the glossary below; never alternate synonyms (e.g. do not mix "giỏ hàng" and "đơn hàng" for the same thing).
2. **No half-English phrases.** Wrong: `LIÊN HỆ SALES`. Right: `LIÊN HỆ KINH DOANH` (or `LIÊN HỆ BÁN HÀNG`). Allowed English: brand names, product codes, and loanwords in the glossary (`catalogue`).
3. **Check that the word means the same thing here.** Wrong: `Menu` → `Danh mục` ("danh mục" = category, and it clashes with "Chọn danh mục sản phẩm"). Right: `Menu`.
4. **Address the customer as "bạn"**, friendly-professional. Requests start with `Vui lòng…`; never use imperative-only commands in error messages.
5. **Sentence case in Vietnamese** (only the first word and proper nouns capitalised). CTAs get capitals from CSS (§5.3), not from the string.
6. **Vietnamese formats:** `150 × 150 mm`, dates `dd/mm/yyyy`, thousands separator `.` (`130.000 ₫`), phone `(+84) 347 099 905`.
7. **Keep it short.** Vietnamese is usually 10–30% longer than English. If a VI label wraps or overflows where EN doesn't, rewrite it shorter — never shrink the font.
8. **Official names are copied, not translated:** province names (§12.1), company legal names (§10), IMO/IMPA/ISSA terms.
9. Every translation is reviewed by a Vietnamese-speaking person before launch; the agent's hand-off lists every string it created or changed.

**Glossary (use exactly these)**

| EN | VI | Note |
|---|---|---|
| Order (noun) | đơn hàng | the customer's list of items — never "giỏ hàng" |
| Order (nav / CTA) | ĐẶT HÀNG | |
| Add (to order) | THÊM / THÊM VÀO ĐƠN HÀNG | toast: "Đã thêm vào đơn hàng" |
| Product lookup | Tra cứu sản phẩm | |
| Product range | Dòng sản phẩm | |
| Catalogue | catalogue | loanword, lowercase in sentences |
| Contact sales | Liên hệ kinh doanh | |
| Contact & Shipping | Thông tin liên hệ & giao hàng | |
| City / Province | Tỉnh / Thành phố | |
| Country | Quốc gia | |
| Payment | Thanh toán | |
| Pay now | THANH TOÁN NGAY | |
| Deposit | Đặt cọc | |
| Shipping fee | Phí vận chuyển | |
| Edition | Phiên bản | |
| SKU | mã sản phẩm | |
| Reset selection | Đặt lại lựa chọn | |
| Menu | Menu | not "Danh mục" |

### 8.2 Bilingual side-by-side review (required before hand-off)

Every visible string MUST be pulled in **both languages** and reviewed side by side — not only the landing sections, but also the order steps, the Order Summary, toasts, error messages and every pop-up.

**Where strings come from (collect all three):**
1. The `vi` dictionary in `src/lib/locale.js` (every key = EN, value = VI).
2. Text built inline in components with `language === 'vi' ? … : …` (counts, statuses, currency lines). These MUST be moved into `locale.js`; list any that remain.
3. Data fields: `*_en` / `*_vi` in the JSON files, `corporate.js`.

**States to render in both `?lang=en` and `?lang=vi`** (capture `innerText` of each):
- Page on load · search with results · search with no results
- Each configurator step open, complete and locked (incl. unlock hints)
- Order Summary empty → 1 item → payment option chosen; mobile bottom bar and sheet
- Contact & Shipping with every validation error shown
- Payment step · card pop-up · bank transfer/VietQR pop-up · ZaloPay pop-up · pending / confirmed / failed states
- Contact Sales pop-up (empty, errors, sent) · header mobile menu · footer

**Output:** a table `Area | Key | EN | VI | Issue` saved as `docs/translation-review-<slug>.md`. Flag: missing VI, EN left in VI view, inconsistent term (vs. glossary), wrong meaning, VI longer than the space, wrong number/currency format.

---

## 9. Interface clarity rules

The goal of every area: the user sees **only what they need to make the next decision**.

1. **No self-explaining UI text.** Don't write "Click a category below to begin", "Use this box to search", "This section shows…". Labels and headings are enough.
2. **One primary action per view.** Only one red button visible in a card/section at a time.
3. **No redundant controls.** If the system advances automatically (e.g. Payment unlocks when Contact & Shipping is valid), there is no "Continue" button.
4. **Hide empty states that carry no information.** No "$0.00 / 0 products" bars; the mobile order bar appears only after the first item.
5. **Locked steps:** show the step title only; the *next* locked step shows one short unlock hint (≤ 6 words, e.g. "Select a sign first"). Later locked steps collapse to a title row.
6. **Disabled, not hidden, for global actions** whose meaning is clear (e.g. `Reset selection` is disabled until something is selected).
7. **Placeholders are examples, not instructions** ("IMPA, ISSA, barcode or name").
8. **Errors appear on blur**, under the field, in 14px red, ≤ 8 words, saying what to fix ("Enter a valid email address").
9. **Copy limits:** hero H1 ≤ 12 words; H2 ≤ 6 words; intro ≤ 30 words; feature card body ≤ 14 words; button label ≤ 3 words.
10. **No decorative text** that can't be read (faint watermarks, tiny uppercase slogans). If it's on the page, it must pass contrast.
11. Numbers users compare (price, size, quantity) are always visible without hovering or expanding.

---

## 10. Footer (fixed copy — do not edit per product)

Layout: 3 columns separated by 1px dividers (`rgba(255,255,255,.12)`), columns size to their content, space distributed between them. Tablet: brand full width, Company | Contact below. Mobile: one column with 1px top dividers.

```
<PRODUCT> by DLV Corporation              ← brand title (fs-3, "by DLV Corporation" on its own line in --red)
<product tagline EN/VI>                   ← fs-5, the only per-product footer text

COMPANY                                   ← column heading, fs-5, uppercase, --coral
CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI DỊCH VỤ VÀ TƯ VẤN ĐỖ LÊ VŨ
DLV CORPORATION
Tax code: 0307940363                      ← VI: "Mã số thuế: 0307940363"

CONTACT
[pin]   29 Nguyen Van Quy Street, Tan Thuan Ward, Ho Chi Minh City, Vietnam   → Google Maps (new tab)
[phone] (+84) 347 099 905   [WhatsApp] [Zalo]                                → tel: / wa.me/84347099905 / zalo.me/0347099905
[mail]  info@dlvcorp.com                                                      → mailto:

© <current year> DLV Corporation. All rights reserved.       ← VI: "Bảo lưu mọi quyền."
```

- Source of truth: `src/data/corporate.js`. Agents MUST NOT retype these strings elsewhere.
- Company legal names and address: single line at ≥ 1296px (`white-space: nowrap`), wrap below.
- The year is computed at build/runtime, never hard-coded (**Hyperion deviation:** currently hard-coded `2026`).

---

## 11. Responsive behaviour summary

| Component | Mobile (< 768) | Tablet (768–1023) | Laptop / Desktop (≥ 1024) |
|---|---|---|---|
| Header | Logo · EN/VI · Menu | Logo · EN/VI · Menu | Logo · nav · EN/VI · Contact Sales |
| Hero | Uniform dark overlay; buttons full-width, stacked | Left text, buttons inline | Left text, buttons inline |
| Feature section | Stacked; cards 1 column | Stacked; cards 2×2 | Image 5/12 + text 7/12; cards 2×2 |
| Category options | 1 column | 2 columns | 2 columns |
| Sign/design grid | 2 columns | 3 columns | 4 columns |
| Shipping form | 1 column | 2 columns | 2 columns |
| Payment amount (full / deposit) | 1 column | 2 columns | 2 columns |
| Payment methods | 1 column | 1 column | 1 column |
| Order summary | Bottom bar → sheet | Sticky 280px | Sticky 320 / 360px |
| Footer | 1 column | brand row + 2 columns | 3 columns |

- No horizontal scrolling at any width ≥ 360px (`document.documentElement.scrollWidth === innerWidth`).
- Sticky elements must never cover a focused input (`scroll-padding-top: header + 20px`, `scroll-padding-bottom: 100px` on mobile).
- Section navigation always glides — see §11.1.

### 11.1 Navigation & scroll motion (fixed behaviour)

When a click moves the customer to another part of the page, the page MUST glide there — never jump. Reason: an instant jump makes the customer lose their place and feel the page "switched".

**One helper only.** Every section move goes through `scrollToElement(target, { onDone })` in `src/lib/scroll.js`. Agents MUST NOT use `scrollIntoView()`, `location.hash`, `scrollTo()` or CSS `scroll-behavior` for section navigation.

**Actions that MUST use it**

| Trigger | Destination |
|---|---|
| Header `PRODUCT LOOKUP` / `ORDER` (desktop links and mobile menu) | Search card / configurator |
| Hero primary button (`Find your <noun>`) | Configurator |
| Order Summary `ORDER` / `PAY NOW` button | Contact & Shipping / Payment step |
| Order Summary "View order" (desktop/tablet) | Order Summary card |
| Selecting an option when the next step is off-screen (top < 110px or bottom > viewport − 100px) | Next step |
| Programmatic jumps (`hyperion:lookup`, `hyperion:configure` events) | Search card / configurator |

In-list moves (e.g. "Show more results" revealing the next card inside a scroll box) are exempt — they use `block: 'nearest'` without animation.

**Motion values (exact)**

| Setting | Value |
|---|---|
| Landing position | target top = sticky header bottom **+ 16px** (never under the header) |
| Duration (normal) | `distance(px) × 0.35` ms, floored at **480ms**, capped at **800ms** |
| Duration (`prefers-reduced-motion: reduce`, e.g. Windows "Animation effects" off) | **320ms** — still a glide, never an instant jump |
| Easing | ease-in-out cubic: `p < .5 ? 4p³ : 1 − (−2p + 2)³ / 2` |
| Cancel | stops immediately on the user's `wheel`, `touchstart` or `keydown` |
| New click during a glide | cancels the running glide and starts from the current position |
| Hidden/background tab | goes straight to the target (animation frames are paused there) |
| Distance < 2px | no movement |

**Other motion**
- After arriving, move keyboard focus to the destination heading with `focus({ preventScroll: true })` so screen readers follow without a second jump.
- Update the URL hash with `history.replaceState` (no extra history entries).
- Hover/state transitions: `150ms ease` on background and border colour only. No parallax, no scroll-triggered animations. The only self-moving elements allowed are the two in §11.2.
- With `prefers-reduced-motion: reduce`, remove all transitions except the shortened section glide.

### 11.2 Self-moving elements (auto-slide & rotating image)

Only two elements may move on their own, and only if the product brief includes them. Both use the **same reduced-motion check**: `matchMedia('(prefers-reduced-motion: reduce)')`, listened to live (`change` event), so turning Windows "Animation effects" off freezes them immediately without a reload. *Verify on a Windows machine with Animation effects off — that is how many customers' PCs are set.*

**A. Product range strip (auto-slide)**

| Behaviour | Value |
|---|---|
| Default | Slides continuously and slowly, right → left, **24px per second**, seamless loop (card list rendered twice; the copy is `aria-hidden="true"` and `inert`) |
| Stops **only** while | the mouse is over the strip · the strip is being dragged (mouse or touch) · keyboard focus is on a card inside the strip (`focusin` → stop, `focusout` leaving the strip → resume) |
| Resumes | immediately when none of the three conditions is true, from the current position (no jump back) |
| Drag | pointer drag moves the strip 1:1; release continues auto-slide from there; a drag > 6px cancels the card click |
| Keyboard | cards are focusable links in DOM order; `Tab` moves card to card and the strip scrolls so the focused card is fully visible |
| Also pauses | when the tab is hidden (`visibilitychange`) — resume on return |
| Reduced motion | **frozen** — no auto-slide at all; the strip is a normal horizontal scroll area (drag, trackpad, keyboard, and ‹ › buttons 44×44px appear) |
| Card size | 240px wide desktop / 200px mobile, gap 16px, image 1:1 on white |

**B. Hero rotating product image**

| Behaviour | Value |
|---|---|
| Default | Rotates through 3–5 product images, **5 seconds** per image, **600ms** cross-fade (opacity only) |
| Pauses | while the mouse is over the image, while any element inside the hero has keyboard focus, and when the tab is hidden |
| Reduced motion | **frozen on the first image** — no automatic rotation. If dot controls are shown and the user picks another image, it **switches instantly** (no fade) |
| Controls | optional dots (8px, 44×44px touch target) with `aria-label="Image 2 of 4"`; `aria-live` is **off** (don't announce each rotation) |
| Mobile (< 768px) | not shown |
| Images | only from the product folder (§4), same size/aspect, `object-fit: contain` |

Both elements must also meet WCAG 2.2.2 (pause/stop/hide for moving content): the hover/focus/drag pause and the reduced-motion freeze satisfy it — do not remove them.

---

## 12. Data contract (functionality reuse)

The shopping flow is data-driven. A new product changes data, not code.

| File | Role | Key fields |
|---|---|---|
| `products.json` | One row per SKU | `id`, `barcode`, `internal_reference`, `product_family_id`, `display_name_en/vi`, `customer_category_en/vi`, `impa_code`, `issa_code`, `dimensions_display`, `edition`, prices, `image_url` |
| `families.json` | One row per design (groups SKUs) | `id`, `display_name_en/vi`, `sku_ids[]`, `image_url`, `direction` |
| `taxonomy.json` | Step 1 categories | `groups[]`: `id`, `label_en/vi`, `order` |
| `configurator.json` | Which steps each category uses, in order | `branches.<category-id>`: ordered list of fields (e.g. `config_concept`, `config_direction`, `dimensions_display`, `product_family_id`, `edition`) + `concepts`, `directions`, `families` mappings |
| `corporate.js` | Footer/company facts | fixed (§10) |
| `checkout/config.js` | Deposit and enabled payment methods | `depositUSD`, `depositVND`, `methods` — never put secrets here |

Rules: IDs are stable strings; every `_en` field has a `_vi` twin; images follow §4; a step whose field has only one possible value for the current selection is auto-selected and shown as complete.

### 12.1 Checkout — Contact & Shipping form

**Field order (fixed):**

| # | Field | Type | Required |
|---|---|---|---|
| 1 | Full name | text | yes |
| 2 | Company | text | no |
| 3 | Email | email | yes |
| 4 | Phone / WhatsApp | tel (international format) | yes |
| 5 | **Country** | searchable dropdown (existing `country-select`) | yes |
| 6 | **City / Province** | dropdown **that follows the selected country** — or free text (see below) | yes |
| 7 | Shipping address | text, full width | yes |

Country MUST sit directly before City / Province (same row on desktop/tablet: Country left, City / Province right).

**City / Province behaviour**

| Situation | Behaviour |
|---|---|
| No country chosen yet | City / Province disabled; placeholder `Select a country first` / `Chọn quốc gia trước` |
| Country **has a list** (VN, US, CA, AU, MY) | Searchable dropdown of that country's units, same component and keyboard model as Country (type to filter, ↑/↓, Enter, Esc). The value MUST be picked from the list; typed text that matches no option is invalid → error `Select a province from the list` / `Chọn tỉnh / thành phố trong danh sách` |
| Country **has no list** (e.g. Japan) | Plain text input, as before; any non-empty text is valid |
| Country changed to a different country | The City / Province chosen for the old country is **cleared** and the field shows empty; Payment re-locks until it is filled again |
| Same country re-selected | City / Province is **kept** |
| Listed → unlisted country (e.g. Vietnam → Japan) | cleared; field becomes free text |
| Unlisted → unlisted (e.g. Japan → Korea) | cleared (the text belonged to the old country) |
| Language switch | stored value is a code; label re-renders in the new language |

**Stored value:** `{ countryCode: 'VN', regionCode: 'ho-chi-minh', regionName: 'Thành phố Hồ Chí Minh' }` for listed countries; `{ countryCode: 'JP', regionCode: null, regionName: '<free text>' }` otherwise. `regionCode` is a stable ID: the ISO 3166-2 subdivision code where one exists (US, CA, AU, MY — e.g. `US-CA`, `CA-ON`), and a lowercase slug for Vietnam's 2025 units. Region lists live in `src/data/regions.json`: `{ "VN": [{ "code", "name_en", "name_vi" }], "US": [...], ... }`.

**Lists (exact counts)**

- **Vietnam — 34 provincial-level units** (structure in force since 1 July 2025; the company address "Tan Thuan Ward, Ho Chi Minh City" already uses it). Do not use the old 63-province list.
  - 6 centrally-run cities: Hà Nội · Huế · Hải Phòng · Đà Nẵng · Thành phố Hồ Chí Minh · Cần Thơ
  - 28 provinces: Tuyên Quang · Cao Bằng · Lai Châu · Lào Cai · Thái Nguyên · Điện Biên · Lạng Sơn · Sơn La · Phú Thọ · Bắc Ninh · Quảng Ninh · Hưng Yên · Ninh Bình · Thanh Hóa · Nghệ An · Hà Tĩnh · Quảng Trị · Quảng Ngãi · Gia Lai · Khánh Hòa · Lâm Đồng · Đắk Lắk · Đồng Nai · Tây Ninh · Vĩnh Long · Đồng Tháp · Cà Mau · An Giang
  - VI labels keep diacritics; EN labels use the common English form without diacritics (Hanoi, Hue, Hai Phong, Da Nang, Ho Chi Minh City, Can Tho, Dak Lak…). Sort alphabetically in the current language, cities first.
- **United States — 51**: 50 states + District of Columbia.
- **Canada — 13**: 10 provinces + 3 territories (Northwest Territories, Nunavut, Yukon).
- **Australia — 8**: 6 states (NSW, Victoria, Queensland, South Australia, Western Australia, Tasmania) + Australian Capital Territory + Northern Territory.
- **Malaysia — 16**: 13 states + 3 federal territories (Kuala Lumpur, Labuan, Putrajaya).
- Any other country: no list → free text.

**Required tests (run in the preview)** — each case scripted *and* repeated with real mouse clicks and keyboard-only use:

| # | Steps | Expected |
|---|---|---|
| 1 | Country = Vietnam | dropdown shows exactly 34 units; "Thành phố Hồ Chí Minh" / "Ho Chi Minh City" present; no pre-2025 names (e.g. "Bình Dương", "Bà Rịa – Vũng Tàu") |
| 2 | Country = United States / Canada / Australia / Malaysia | 51 / 13 / 8 / 16 options |
| 3 | Vietnam → pick Đà Nẵng → change to United States | City / Province cleared; Payment locked |
| 4 | Vietnam → pick Đà Nẵng → re-select Vietnam | Đà Nẵng kept |
| 5 | Vietnam → type "Tokyo" (no option picked) → blur | error shown; Payment stays locked |
| 6 | Country = Japan → type "Tokyo" | accepted as free text; Payment unlocks when other fields valid |
| 7 | Japan + "Tokyo" → change to Canada | cleared; now a dropdown |
| 8 | Keyboard only: Tab to Country, type "viet", Enter, Tab to City / Province, type "hue", ↓, Enter | Huế selected, focus order Country → City / Province → Shipping address |
| 9 | Switch EN ↔ VI with a province selected | same province, label in the new language |
| 10 | Mobile 390px | both dropdowns open fully on screen, options ≥ 44px tall |

---

## 13. Accessibility (non-negotiable)

- All interactive elements reachable by keyboard; visible focus ring `3px solid #2871b7`, offset 2–4px (on dark: white).
- Steps are `<fieldset>`/`<legend>`; locked steps set `aria-disabled` and `aria-describedby` → hint.
- Live cart updates announced via the `#cart-feedback` `role="status"` region.
- Icons are `aria-hidden`; icon-only links have `aria-label`.
- Form fields have `<label>`, `autocomplete`, and error text linked via `aria-describedby`.

---

## 14. Performance budgets

- Total page weight on first load ≤ **2.5 MB** (images WebP; theme backgrounds ≤ 350 KB each).
- Only 3 font files (Be Vietnam Pro 400/600/700 WOFF2, Vietnamese + Latin subset).
- No third-party scripts except payment providers when enabled.
- Largest Contentful Paint (hero) ≤ 2.5s on 4G.

---

## 15. Hand-off checklist (agent must report each)

- [ ] Section order and backgrounds match §1; no dark sections adjacent.
- [ ] All images are from `src/assets/products/<slug>/` or the product's data — list any missing.
- [ ] `grep` shows only the 5 font-size tokens and the 9 spacing values; no `clamp()`, no `vw` font sizes.
- [ ] Only Be Vietnam Pro (and at most one approved second font) is loaded.
- [ ] Only the 3 breakpoints (+ footer 1296px rule) are used.
- [ ] Every UI string has a Vietnamese translation; `?lang=vi` renders with VND prices.
- [ ] Footer copy is byte-identical to §10; year is dynamic.
- [ ] No orphan words in headings at 1440 / 1024 / 390px; units, phones, codes never split.
- [ ] Hero H1 lines don't wrap at ≥ 1024px.
- [ ] No horizontal scroll at 360, 390, 768, 1024, 1280, 1440px.
- [ ] Screenshots of every section at 1440px and 390px attached.
- [ ] Full order flow tested: category → item → contact & shipping → payment unlocks automatically; no "Continue" button between steps.
- [ ] All order steps measure identically (title size, 28px badge, padding, radius) — no step-specific overrides (§6.6).
- [ ] Every trigger in §11.1 glides to its target: sample `scrollY` every 50ms after the click — values must pass through intermediate positions (not 0 → target), and the target's top ends at header bottom + 16px. Test once normally and once with `prefers-reduced-motion: reduce` emulated.
- [ ] `grep` finds no `scrollIntoView` / `scroll-behavior` used for section navigation.
- [ ] Every CTA button renders in capitals in EN and VI (via `text-transform`, not capitalised strings) (§5.3); option cards and text links are not uppercase.
- [ ] Bilingual review table `docs/translation-review-<slug>.md` delivered, covering landing, order steps, Order Summary, toasts, errors and every pop-up (§8.2); glossary terms used consistently (§8.1); no inline `language === 'vi'` strings left.
- [ ] If present — Product range strip: slides at 24px/s; stops only on hover, drag, keyboard focus; freezes with reduced motion (§11.2A). Hero rotating image: 5s / 600ms fade; pauses on hover/focus; frozen on first image with reduced motion, manual switch instant (§11.2B). Both tested with Windows "Animation effects" off.
- [ ] Checkout: Country directly before City / Province; all 10 tests in §12.1 pass, by script and by real mouse + keyboard.

---

## Appendix A — Hyperion vs. this standard (migration list)

These are differences in the current Hyperion code that must be fixed when the template is extracted (or before cloning):

| Area | Hyperion today | Standard |
|---|---|---|
| Font | Segoe UI / Arial (system) | Be Vietnam Pro, self-hosted |
| Font sizes | ~40 distinct values incl. `clamp()` | 5 tokens (§5.2) |
| Breakpoints | ~25 distinct | 3 (§6.2) |
| Fluid spacing | `clamp()` in gutters and section padding | fixed per breakpoint (§6.3) |
| Theme images | PNG, 1.7–3.5 MB each | WebP ≤ 350 KB |
| Footer year | hard-coded 2026 | dynamic |
| Catalogue | EN PDF only | EN + VI when available |
| Asset names | `hyperion-*` theme files | neutral `theme-*` names |
| Hero H1 size | 47px (fluid) | 40px / 28px mobile |
| Order step titles | 18px (16px locked/mobile) | 20px / 16px mobile (§6.6) |
| Prices in steps | 22px (18px mobile) | 20px (§6.6) |
| Focus after section glide | only "View order" moves focus to its heading | every §11.1 destination receives focus |
| CTA text case | mixed: `Find your sign`, `Download catalogue`, `Find products`, `Add`, `Show more results` in normal case; `CONTACT SALES`, `ORDER`, `PAY NOW`, `SEND REQUEST` typed in capitals in `locale.js` | all CTAs uppercase via CSS, strings in sentence case (§5.3) |
| VI wording | `Menu` → "Danh mục" (wrong meaning); `LIÊN HỆ SALES` (mixed language); "giỏ hàng" and "đơn hàng" both used for the order | glossary §8.1 |
| Inline VI strings | 7 `language === 'vi' ? … : …` strings in components (counts, search status, summary) | all in `locale.js` (§8.2) |
| Checkout field order | Address → City / Province → Country | Country → City / Province → Address (§12.1) |
| City / Province | free text for every country | dropdown for VN (34), US, CA, AU, MY; free text otherwise (§12.1) |
| Product range strip / hero rotating image | not present | optional; if added, follow §11.2 |

**Already compliant in Hyperion (keep as reference):** smooth section scrolling via `src/lib/scroll.js` (§11.1) · Payment step uses the same step styles as the others (§6.6) · no "Continue to payment" button · mobile order bar hidden until the first item · compact locked steps · 3-column footer with fixed copy (§10).
