# Design QA — ajustes de Alex, painel do atleta e patrocinadores

## Evidence

- Source visual truth — modal desalinhado: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-626cae4d-30f3-4b1e-9f97-fc237f0667a0.png`
- Source visual truth — texto sobre a foto: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-73df9171-2fe9-4ba1-b7ce-68462662202f.png`
- Source visual truth — benefícios fora do cadastro: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-33bbb178-1a96-4f67-8c94-b3d8203ad8eb.png`
- Source visual truth — marcas e gráfico: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-51a244cc-2e6f-425d-b431-d71a478f2320.png` e `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-0380e237-e40c-42cd-8304-0f435aeabb4f.png`
- Source visual truth — grupos de patrocinadores: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-e4d216f0-c685-4d3d-af65-f348858f3d55.png` e `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-be154667-d6fe-4c12-88b4-0ecca89ccef3.png`
- Implementation screenshots: `.design/qa-alex-modal-desktop-final.png`, `.design/qa-alex-modal-mobile-final.png`, `.design/qa-member-panel-desktop.png`
- Combined comparisons: `.design/compare-modal-before-after.jpg`, `.design/compare-benefits-before-after.jpg`
- Viewports tested: 1440 × 1000 desktop and 390 × 844 mobile.
- States tested: modal open/closed, cadastro collapsed/open, activity edit/save, chart populated, sponsor admin and footer groups.

## Full-view comparison evidence

The modal comparison shows the original left-anchored surface versus the implementation centered in the viewport. The benefits comparison shows the original independent card versus the implementation nested inside the registration disclosure. Desktop and mobile browser renders were inspected for the complete Alex page and athlete dashboard. The browser's stitched full-page capture repeats sticky elements, so normal viewport captures and DOM geometry were used for focused validation.

## Focused region comparison evidence

- Modal: centered with `centerDeltaX: 0` and `centerDeltaY: 0` in desktop and mobile; explicit dark text on ivory surface; no horizontal overflow.
- Photo statement: desktop panel width 390 px, 31% of the image width; title spans render as two controlled lines. Mobile title spans are 200 px and 245 px inside the available panel width, with no document overflow.
- Athlete registration: `details` is closed by default; “Materiais e benefícios” exists only inside the open registration panel.
- Marks: the form exposes the six standardized race values; legacy category and validation status are absent; each row exposes “Editar atividade”. PATCH persistence was exercised successfully.
- Chart: two populated event series were rendered from 12 months of fixture data, with month axis, time axis, legend and responsive container.
- Sponsors: footer and admin both render Realização, Apoio, Patrocinadores Master and Patrocinadores in the requested order.

## Findings

No actionable P0, P1 or P2 issues remain.

- Fonts and typography: display and body hierarchy remain consistent; the photo title no longer clips or breaks unpredictably.
- Spacing and layout rhythm: modal and nested panels are centered and aligned; chart and forms collapse to one column on mobile.
- Colors and visual tokens: existing ivory, charcoal, olive and brown tokens are preserved; no gradient was introduced.
- Image quality and asset fidelity: supplied photography and sponsor logos remain unchanged and correctly cropped.
- Copy and content: “Benefícios Recebidos”, standardized race labels and four sponsor groups match the requested terminology.
- Accessibility and behavior: native disclosure, labeled select, keyboard-capable buttons, semantic chart label, Escape modal close and touch-sized mobile controls were verified.

## Comparison history

1. P1 modal positioning/color inheritance: fixed by rendering through a document-body portal, raising the overlay layer and defining modal foreground color. Post-fix geometry is centered at both tested viewports.
2. P2 photo overlay density: fixed with a 390 px panel, smaller two-line title and mobile-specific scale. Post-fix measurements show no text overflow.
3. P2 benefits exposure: moved into the closed registration disclosure. Post-fix DOM confirms hidden by default and visible only after opening.
4. P2 mark workflow: replaced free text with normalized race options, removed category/status presentation and added owned-record editing. POST/PATCH flow passed.
5. P2 evolution visibility: added the responsive 12-month multi-series line chart using real mark data.
6. P2 sponsor taxonomy: added shared categories and a startup migration for existing SQLite records; footer and admin both show the expected mapping.
7. A server-render serialization error was found during browser QA and fixed by passing plain mark objects to the client component. Final browser console: no errors or warnings.

## Implementation checklist

- [x] Desktop and mobile modal verified
- [x] Photo title wrapping and coverage verified
- [x] Registration/benefits disclosure verified
- [x] Add and edit mark paths verified
- [x] Six filter-ready event values enforced server-side
- [x] 12-month chart rendered with multiple events
- [x] Footer and admin sponsor groups verified
- [x] TypeScript and optimized Next.js production build passed
- [x] Browser console checked with no errors or warnings

## Follow-up polish

No blocking visual polish remains.

final result: passed
