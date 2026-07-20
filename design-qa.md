# Design QA — OnzeRun Master / Paulista 2026

**Source visual truth**

- `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-83fb0130-cf04-4f9d-95d9-a140993093a3.png`
- The source identifies the broken calendar state and the existing 11RUN visual language. The requested outcome is an intentional redesign, not a pixel-for-pixel reproduction of the broken list.

**Implementation evidence**

- Top/result highlight: `C:/Users/User-PC/Documents/11run Portal 2/.design/qa-master-top.png`
- Album state: `C:/Users/User-PC/Documents/11run Portal 2/.design/qa-master-results.png`
- Final calendar state: `C:/Users/User-PC/Documents/11run Portal 2/.design/qa-master-calendar-approved.png`
- Side-by-side comparison: `C:/Users/User-PC/Documents/11run Portal 2/.design/qa-master-calendar-comparison.jpg`
- Viewport: 1280 × 720, desktop, light theme.
- Route/state: `/11-master#calendario`, public and logged out.

**Findings**

- No actionable P0, P1, or P2 findings remain.
- Fonts and typography: the existing product font and light display hierarchy are preserved; headings remain readable and do not collide with cards.
- Spacing and layout rhythm: content now respects the 1280 px page shell, uses consistent card gaps and radii, and has no horizontal page overflow (`scrollWidth: 1265` at a 1280 px viewport).
- Colors and tokens: surfaces, borders, muted copy, dark featured card, and brown accents use the existing 11RUN tokens without gradients.
- Image quality and asset fidelity: all supplied championship photographs were converted to WebP; the hero and album use real supplied assets with contained/cropped treatments appropriate to their slots.
- Copy and content: the 12-podium summary, medal split, athlete results, ranking highlights, team culture, Aimê/Seiti context, and recruiting message are represented in concise sections.
- Icons and accessibility: Lucide icons match the current product icon system; buttons have accessible names, focus rings, keyboard controls, and reduced-motion handling.
- Responsiveness: desktop rendering has no page overflow; CSS explicitly collapses metrics, album, athlete cards, stories, recruiting CTA, and calendar at 980/940/720 px. The in-app browser surface is fixed at desktop width, so a rendered 390 px capture remains a P3 test gap.

**Primary interactions tested**

- Album next control changed the active photo source.
- Album lightbox opened as a modal dialog and closed successfully.
- Direct result/calendar anchor navigation was tested.
- Browser console checked after rendering and interactions: no errors.

**Focused region comparison evidence**

- Calendar: the combined comparison shows the original unstyled, left-aligned list versus the final two-column status calendar with readable date blocks, locations, and a featured completed event.
- Album: the focused capture shows a selected competition photograph, horizontal thumbnail rail, visible position counter, next/previous controls, and an enlarge affordance.

**Comparison history**

1. Initial reference — P0: the calendar was effectively unstyled and detached from the page shell because its class names did not match the available rules. Fix: replaced the mismatched global-class implementation with a scoped responsive component and semantic event cards.
2. First implementation — P2: deep-link navigation placed the section label too close to the fixed header. Fix: added a reserved anchor offset and global scroll padding, preserving the normal section spacing.
3. Final implementation — post-fix evidence: `qa-master-calendar-approved.png`; heading, summary, featured event, and upcoming events are visible and aligned; no actionable P0/P1/P2 issues remain.

**Implementation checklist**

- [x] Results promoted to the top of the page.
- [x] All supplied photos optimized and album navigation implemented.
- [x] Athlete results and 12-podium totals published.
- [x] Recruitment CTA connected to `/cadastro/11-master`.
- [x] Calendar rebuilt with clear status, date, location, and result link.
- [x] Production build and TypeScript validation passed.
- [x] Browser interactions and console verified.

**Follow-up polish**

- P3: capture an additional physical 390 px browser viewport when the in-app browser supports viewport emulation; responsive rules are already implemented.

final result: passed
