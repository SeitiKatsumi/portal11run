# Design QA — Admin da loja e retirada com atletas

- Source visual truth: `C:\Users\User-PC\AppData\Local\Temp\codex-clipboard-3afb466d-94bf-4548-804e-66406721cfd4.png`
- Implementation screenshot: `C:\Users\User-PC\Documents\11run Portal 2\.design\admin-store-contained-final.png`
- Combined comparison: `C:\Users\User-PC\Documents\11run Portal 2\.design\admin-store-comparison.png`
- Pickup desktop: `C:\Users\User-PC\Documents\11run Portal 2\.design\store-pickup-free-final.png`
- Pickup mobile: `C:\Users\User-PC\Documents\11run Portal 2\.design\store-pickup-mobile.png`
- Desktop viewport: 1280 × 720 CSS px, device scale factor 1.
- Mobile viewport: 390 × 844 CSS px, device scale factor 1.
- Source pixels: 2526 × 966.
- Implementation pixels: 1280 × 720.
- Normalization: the source was proportionally reduced to 1280 px width in the combined comparison; the implementation remained at its native 1280 px width.
- State: admin on the Products tab; storefront cart open with “Retirar com atletas” selected.

## Full-view comparison evidence

The original admin content occupied the full viewport while the header and admin navigation used the portal’s 1280 px maximum container. In the final capture, the header, admin navigation and store panel share the exact same measured frame: 24 px left margin and 1217 px rendered width at the 1280 px viewport. No page-level horizontal overflow was detected.

## Focused-region evidence

The container mismatch affected every major admin region, so the full-view side-by-side comparison was sufficient for the requested layout correction. The new checkout option received separate desktop and mobile focused captures because it was not present in the source screenshot.

## Required fidelity surfaces

- Fonts and typography: existing Geist family, weights, hierarchy and wrapping preserved.
- Spacing and layout rhythm: admin content now uses the shared `.admin-panel` frame and matches header/navigation margins, radii and section gaps.
- Colors and visual tokens: existing `--surface`, `--line`, `--text`, `--muted` and accent tokens preserved; no gradient introduced.
- Image quality and assets: existing square product image and Lucide interface icons preserved without placeholders or generated replacements.
- Copy and content: labels remain consistent with the portal; pickup adds the requested cities and clearly communicates free withdrawal.

## Comparison history

### Iteration 1

- [P1] Admin content escaped the site container.
  - Fix: composed the store root with the shared `admin-panel` class.
  - Post-fix evidence: header, admin navigation and store panel all measure 1217 px wide with the same 24 px left edge.
- [P2] Floating chat overlapped the checkout action.
  - Fix: raised the cart drawer and backdrop above the assistant.
  - Post-fix evidence: drawer z-index 110, assistant z-index 90; checkout button remains fully visible.
- [P2] No free athlete pickup flow.
  - Fix: added fulfillment selection, five-city selector, zero shipping total, persistence and admin display.
  - Post-fix evidence: Americana, Campinas, Itatiba, Mogi Mirim and Recife appear; selected pickup shows “Grátis” and total R$ 59,90 on desktop and mobile.

## Interaction verification

- Product added to cart.
- Delivery toggled to “Retirar com atletas”.
- Pickup city changed to Mogi Mirim and Recife.
- Shipping changed from R$ 19,90 to Grátis.
- Total recalculated without shipping.
- Local persisted order recorded `fulfillment_method=athlete_pickup`, `pickup_city=Mogi Mirim`, `shipping_cents=0`.
- Admin and storefront console: no errors or warnings.

## Findings

No actionable P0, P1 or P2 mismatch remains for the requested scope.

## Follow-up polish

No P3 item is required before release.

final result: passed

---

# Design QA — Circuito Virtual 11Run

- Página pública desktop: `.design/circuito-virtual-desktop.png`
- Página pública mobile: `.design/circuito-virtual-mobile.png`
- Painel administrativo: `.design/circuito-virtual-admin.png`
- Viewports: 1440 × 900 e 390 × 844 CSS px.

## Verificações

- Cabeçalho, página pública, painel administrativo e configuração da edição usam o container central do portal.
- Desktop: largura do documento e viewport iguais (1425 px após scrollbar), sem overflow horizontal.
- Mobile: largura do documento e viewport iguais (375 px após scrollbar), sem overflow horizontal.
- Painel: navegação e conteúdo medidos em 1280 px no viewport desktop de 1440 px.
- Apenas um cabeçalho e um rodapé são renderizados.
- Formulário adapta para uma coluna, mantém labels visíveis e controles com área adequada para toque.
- CTA mobile permanece acima do chat para não bloquear ações.
- Ranking, estados vazios, filtros, formulário e fila administrativa preservam a identidade visual do portal.

final result: passed

---

# Design QA — Home com Ayla e fundo escurecido

## Evidências

- Fonte visual principal: `D:/active projects/Z1 Elevenmind/11run/ayla/ayla web/JPEG/1.jpg`
- Referência do layout preservado: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-c9d5cba7-0a8c-4ceb-8bd8-e417fdb03e59.png`
- Implementação desktop: `C:/Users/User-PC/Documents/11run Portal 2/.design/home-ayla-trofeus-desktop.png`
- Implementação mobile: `C:/Users/User-PC/Documents/11run Portal 2/.design/home-ayla-trofeus-mobile.png`
- Comparação lado a lado: `C:/Users/User-PC/Documents/11run Portal 2/.design/home-ayla-trofeus-comparison.png`
- Rota: `http://127.0.0.1:3000/`
- Estado: home carregada, animações concluídas e menu fechado.

## Normalização

- Imagem-fonte: 1920 × 1081 px.
- Captura desktop: 1350 × 812 px, viewport CSS de 1350 × 812, densidade 1.
- Captura mobile: 375 × 844 px úteis, viewport CSS configurado em 390 × 844, densidade 1.
- A comparação visual foi normalizada para dois painéis de 675 × 406 px, preservando o recorte `cover` usado pelo hero.

## Comparação visual

### Visão completa

- A fotografia correta ocupa todo o hero, sem estiramento ou perda de nitidez.
- O rosto permanece visível e centralizado nos dois breakpoints.
- O overlay sólido de 58% reduz os realces da jaqueta branca e dos troféus sem apagar a imagem.
- Título, subtítulo, navegação e seis cards mantêm a composição da home de referência.
- Não há overflow horizontal: `scrollWidth` e `clientWidth` coincidem em desktop e mobile.

### Regiões focadas

- **Título sobre a jaqueta:** contraste suficiente, contornos das letras preservados e nenhuma palavra perdida no fundo.
- **Cards sobre o tronco e mesa:** fundo translúcido escuro, bordas e textos permanecem legíveis.
- **Header sobre os troféus:** superfície clara translúcida mantém logo e navegação distintos do fundo.
- **Mobile:** o rosto fica acima do título, os cards mantêm duas colunas e o assunto principal não é cortado.

## Superfícies obrigatórias

- **Tipografia:** família, pesos, tamanhos, entrelinhas e quebras foram preservados.
- **Espaçamento e ritmo:** header, chamada e grade mantêm alinhamento, margens, raios e espaçamentos existentes.
- **Cores e tokens:** nenhuma cor estrutural foi alterada; somente o overlay passou para 58% para o contraste solicitado.
- **Imagem:** WebP de 1920 × 1081, 147.806 bytes, sem artefatos visíveis ou deformação.
- **Conteúdo:** textos, links e nomes dos projetos permanecem inalterados.
- **Acessibilidade e execução:** sem erros no console; foco, links e navegação continuam funcionais.

## Findings

Nenhuma divergência P0, P1 ou P2 foi encontrada. A mudança solicitada está fiel ao layout existente e ao novo material visual.

## Histórico de comparação

- Passo único: nova imagem aplicada com overlay de 58%; comparação desktop/mobile aprovada sem necessidade de correções adicionais.

## Follow-up polish

Nenhum ajuste P3 necessário para esta entrega.

final result: passed
