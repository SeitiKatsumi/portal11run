# Design QA — Loja 11RUN

- Source visual truth: `C:\Users\User-PC\AppData\Local\Temp\codex-clipboard-5ef72dad-99e9-44db-9354-f50f00fa7259.png`
- Desktop implementation: `C:\Users\User-PC\Documents\11run Portal 2\.design\store-layout-fixed-top.png`
- Focused product card: `C:\Users\User-PC\Documents\11run Portal 2\.design\store-layout-fixed-final.png`
- Mobile implementation: `C:\Users\User-PC\Documents\11run Portal 2\.design\store-layout-fixed-mobile.png`
- Side-by-side comparison: `C:\Users\User-PC\Documents\11run Portal 2\.design\store-layout-comparison.png`
- Desktop viewport: 2048 × 1024 CSS px, device scale 1
- Source pixels: 2048 × 1024
- Desktop implementation pixels: 2048 × 1024
- Mobile viewport and pixels: 390 × 844, device scale 1
- State: catálogo com produto padrão; botão de compra disponível; carrinho testado com uma unidade PP

## Full-view comparison evidence

The supplied screenshot documented the broken full-width state. The revised implementation uses the same 1280 px centered frame as the site header and other public pages. Hero and catalog now share the same margins, surface, border, radius, spacing, and background tokens as the existing 11RUN visual system.

## Focused region comparison evidence

The product card was checked separately because the source screenshot cut the purchase action below the viewport. The final card has a centered 1:1 image (`372 × 372` inside a `374 px` card), visible title, description, price, sizes, quantity, shipping note, and a high-contrast “Adicionar ao carrinho” button. At desktop width the grid resolves to three centered `374 px` tracks; unused tracks collapse, so a single product is centered. Mobile has no horizontal overflow.

## Required fidelity surfaces

- Fonts and typography: existing global font and weight hierarchy preserved; product copy reduced to card-scale sizes.
- Spacing and layout rhythm: page frame, header offset, section gaps, radii, and internal card spacing now match the existing site.
- Colors and visual tokens: only existing `--surface`, `--line`, `--text`, `--muted`, and accent tokens are used. The invalid `--ink` reference was removed.
- Image quality and asset fidelity: original optimized WebP retained, centered without cropping using `object-fit: contain` in a 1:1 frame.
- Copy and content: supplied title, description, price, sizes, fixed shipping, and cart labels are preserved.

## Comparison history

1. P1 — Full-width page broke the established site frame.
   - Fix: added the shared 1280 px centered frame and correct fixed-header offset.
   - Evidence: `store-layout-comparison.png`.
2. P1 — Product presentation was oversized and purchase action fell below the visible card area.
   - Fix: compact three/two/one-column responsive grid with a complete action area inside each card.
   - Evidence: `store-layout-fixed-final.png`.
3. P1 — Purchase button text was invisible because `--ink` did not exist.
   - Fix: replaced the invalid token with the global `--text` token in storefront and store admin styles.
   - Evidence: computed button colors are `rgb(33,31,27)` background and white text; cart interaction passed.
4. P2 — One product aligned to the first grid column.
   - Fix: switched to centered `auto-fit` tracks; the single product now sits at the horizontal center.
   - Evidence: desktop card x=830 in a 2048 px viewport; three-column capacity retained.

## Browser checks

- Product card and image dimensions checked at desktop and mobile.
- “Adicionar ao carrinho” resolved uniquely and added the product.
- Cart drawer showed the item, selected size, subtotal, shipping, total, and secure checkout action.
- No browser console errors or warnings.
- No horizontal overflow at 390 px.

## Findings

No remaining actionable P0, P1, or P2 visual issues for the requested scope.

## Follow-up polish

The floating chat remains available throughout the store, consistent with the rest of the site.

final result: passed
