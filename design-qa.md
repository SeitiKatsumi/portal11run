# Design QA — Alex Sandro Lopes

## Evidence

- Source visual truth: `.design/alex-option-1.png`
- Final desktop implementation: `.design/alex-final-desktop.png`
- Final mobile implementation: `.design/alex-final-mobile.png`
- Side-by-side comparison: `.design/alex-design-comparison-final.png`
- Route: `/institucional/alex-sandro-lopes`
- Desktop viewport tested: 1440 × 1024 target (browser content viewport reported 1265 px)
- Mobile viewport tested: 390 × 844 target (browser content viewport reported 375 px)
- State: initial page, curriculum expanded, gallery lightbox open/closed, application modal open/closed, mobile menu open/closed

## Full-view comparison evidence

The selected concept and implementation share the same warm ivory canvas, hairline borders, rounded 11RUN navigation, asymmetric photo-led hero, oversized lightweight type, muted olive accents, editorial section rhythm, vertical timeline, achievement ledger, photo interludes, formation grid, gallery, curriculum accordion and final CTA. The implementation uses the supplied real photographs and verified curriculum content instead of generated or placeholder material.

The browser backend repeated sticky elements during full-page raster capture. For that reason, final visual judgment used the complete source mock together with normal viewport captures of the hero, gallery, footer/CTA and mobile states. The DOM was also inspected across every section.

## Focused region comparison evidence

- Hero: compared in `.design/alex-design-comparison-final.png`; photo angle, two-column balance, typography, button hierarchy, palette and header treatment match the selected direction.
- Mobile gallery: inspected in `.design/alex-mobile-gallery.png`; images load at full quality, stack without horizontal overflow and preserve usable rounded crops.
- Interactive curriculum and application form: inspected in-browser because fidelity depends on open/closed state and keyboard semantics rather than a static crop.

## Findings

No actionable P0, P1 or P2 issues remain.

- Fonts and typography: Geist matches the source's modern grotesk character; display weight, body scale, line height and hierarchy are consistent and remain readable on mobile.
- Spacing and layout rhythm: section widths, generous vertical rhythm, dividers, radii and photo proportions follow the source. No nested-card wall or excess elevation was introduced.
- Colors and visual tokens: ivory, charcoal and olive tokens are consistent. No gradients remain. Contrast is sufficient for text and controls.
- Image quality and asset fidelity: all visible photography comes from the supplied Alex Lopes image set, converted to WebP with explicit dimensions and responsive loading. No placeholders, CSS illustrations or synthetic people remain.
- Copy and content: claims, names, dates, roles, record categories and academic credentials are grounded in the supplied curriculum. No estimated performance numbers are presented.
- Icons: existing Lucide line icons match the site's established icon family and remain optically consistent.
- Accessibility and behavior: semantic headings, alt text, focusable controls, Escape-to-close lightbox behavior, reduced-motion support, keyboard-native details, touch-sized CTAs and zero horizontal overflow were verified.

## Comparison history

1. Initial pass found two P2 fidelity issues: the hero image lacked the source's diagonal editorial crop, and photo overlays used gradients contrary to the visual brief.
2. Fixed the hero with a responsive clipped photographic edge; removed every gradient and replaced the dark photo treatment with a solid translucent content surface.
3. Second pass found a P2 title-wrap mismatch: the desktop title broke into three lines instead of the source's two-line lockup.
4. Fixed the name lockup so “Alex Sandro” remains together on desktop while retaining a safe responsive scale on mobile.
5. Post-fix captures show no overlap, clipping, horizontal overflow, broken image, console warning or missing core interaction.

## Implementation checklist

- [x] Selected design direction implemented
- [x] Supplied images optimized to WebP
- [x] Verified curriculum content incorporated
- [x] Desktop and mobile layouts checked
- [x] Anchor navigation, accordion, lightbox, menu and form checked
- [x] SEO metadata and Person structured data added
- [x] TypeScript and production build passed
- [x] Console checked with no errors or warnings

## Follow-up polish

No blocking polish remains. A future content pass may attach individual competition marks and athlete photos if additional verified source material becomes available.

final result: passed
