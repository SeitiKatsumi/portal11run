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

# Design QA — navegação Referências / Rankings

- Fonte visual: `C:\Users\User-PC\AppData\Local\Temp\codex-clipboard-0a8bd448-8fd7-4657-b9b1-b00722424aea.png`
- Implementação: `C:\Users\User-PC\Documents\11run Portal 2\.design\rankings-menu-desktop.png`
- Comparação combinada: `C:\Users\User-PC\Documents\11run Portal 2\.design\rankings-menu-comparison.png`
- Fonte: 1380 × 353 px.
- Implementação: 1265 × 712 px; viewport CSS interno informado pelo navegador: 1280 × 720, densidade 1.
- Normalização: a implementação foi ampliada proporcionalmente para 1380 px de largura e recortada na mesma altura da referência.
- Estado: `Referências` aberto e segunda camada `Rankings` expandida.

## Comparação visual

- A identidade da referência foi preservada: superfícies claras, borda fina, raios amplos, tipografia compacta em caixa alta, ícones lineares e sombra suave.
- A alteração de arquitetura é intencional: a referência exibia os países diretamente; a implementação mostra primeiro `Rankings` e abre os sete rankings em uma segunda camada lateral.
- O submenu secundário permanece dentro do viewport, sem overflow horizontal da página (`scrollWidth` igual a `clientWidth`, ambos 1265 px na área útil).
- Brasil aparece primeiro, seguido por EUA, Japão, Noruega, Quênia, Uganda e Mundial.

## Superfícies obrigatórias

- Tipografia: família, pesos, espaçamento entre letras e hierarquia do cabeçalho preservados.
- Espaçamento e ritmo: menus com 10 px de padding, itens de 38 px, raio do portal e corredor de 7 px entre camadas.
- Cores e tokens: `--surface`, `--surface-muted`, `--line`, `--text`, `--muted` e `--accent-strong`, sem degradê.
- Imagens e ícones: logo original preservado; ícones existentes da biblioteca Lucide, sem aproximações ou placeholders.
- Conteúdo: rótulo `Rankings` e todos os destinos solicitados estão presentes e semanticamente agrupados.

## Interações verificadas

- Clique em `Referências` abre a primeira camada.
- Clique ou hover em `Rankings` abre a segunda camada.
- Foco por teclado mantém os dois níveis acessíveis e expõe `aria-expanded`.
- No mobile, a mesma hierarquia usa `details/summary`, rolagem própria e fechamento ao selecionar um destino.
- O override visual estreito do navegador integrado não alterou o viewport nesta sessão; a estrutura mobile foi conferida pelo DOM, pelas regras do breakpoint de 1060 px, pelo typecheck e pelo build.
- Nenhum erro de console foi encontrado no estado testado.

## Findings

Nenhuma divergência P0, P1 ou P2 permanece no escopo solicitado. A diferença estrutural em relação à captura é o próprio requisito desta rodada.

final result: passed

---

# Design QA — Soluções de Marketing

- Briefing: `C:\Users\User-PC\.codex\attachments\580d28e2-5c55-4e38-b36e-fa871eae3086\pasted-text.txt`
- Desktop: `C:\Users\User-PC\Documents\11run Portal 2\.design\marketing-solutions-desktop.png`
- Mobile: `C:\Users\User-PC\Documents\11run Portal 2\.design\marketing-solutions-mobile.png`
- Viewports: 1265 × 712 e 390 × 844 CSS px, densidade 1.

## Verificações

- Apenas um H1; hierarquia H2/H3 coerente e conteúdo semântico.
- Container do portal preservado em desktop e mobile.
- `scrollWidth` igual ao `clientWidth` nos dois breakpoints; nenhum overflow horizontal da página.
- Hero mantém contraste, imagem real otimizada, CTAs claros e badges legíveis.
- Comparativo Futuro × Master passa para blocos verticais no mobile.
- Processo usa trilho com scroll snap no mobile, sem comprimir o texto.
- Formulário reorganiza para uma coluna, preserva labels, consentimento e áreas de toque.
- Mockup do dashboard identifica explicitamente os dados como ilustrativos.
- Nenhum erro no console durante a navegação e inspeção.

## Superfícies obrigatórias

- Tipografia: família do portal, pesos leves em títulos e corpos com entrelinha confortável.
- Espaçamento: ritmo amplo, cards consistentes e alinhamento compartilhado com header e footer.
- Cores: preto, branco, cinza e acento institucional; contraste aprovado visualmente.
- Imagens: WebP real da 11Run, carregado sem falha e com texto alternativo.
- Conteúdo: evita garantias, diferencia curto e longo prazo e explicita proteção dos jovens atletas.

## Findings

Nenhum problema P0, P1 ou P2 permanece no escopo da landing page.

final result: passed

---

# Design QA — Jornada 11Run Futuro

- Source visual truth: `C:\Users\User-PC\AppData\Local\Temp\codex-clipboard-7393c291-a1c0-45a5-8f2d-7c0a16a08b30.png`
- Implementation screenshot: `C:\Users\User-PC\Documents\11run Portal 2\.design\journey-desktop-implemented.png`
- Combined comparison: `C:\Users\User-PC\Documents\11run Portal 2\.design\journey-comparison.png`
- Source pixels: 1959 × 879.
- Implementation pixels: 1265 × 712.
- CSS viewport: 1265 × 712, device scale factor 1.
- State: modo “Ver por idade”, 12 anos selecionado.

## Full-view comparison evidence

A referência mostrava dez colunas comprimidas, rótulos sobrepostos e fluxo institucional quebrado. A implementação apresenta um carrossel com cartões, scroll snap, controles anterior/próximo, indicação de idade e painel de detalhes independente. `scrollWidth` e `clientWidth` medem 1265 px, sem overflow horizontal da página.

## Focused-region comparison evidence

A comparação combinada concentra a linha do tempo e o painel de detalhes, que eram as áreas críticas. Os rótulos agora têm largura estável, hierarquia por número e nome, e a etapa selecionada permanece identificável sem depender apenas de cor.

## Required fidelity surfaces

- Fonts and typography: família e pesos existentes preservados; números ganham escala de leitura e rótulos deixam de usar texto vertical.
- Spacing and layout rhythm: cards com largura previsível, gaps de 10 px, painel contido e alinhado ao detalhe.
- Colors and visual tokens: somente tokens existentes de superfície, linha, texto, muted e accent.
- Image quality and assets: nenhuma nova imagem ou aproximação gráfica; ícones Lucide existentes preservados.
- Copy and content: conteúdo de 10 a 15 anos preservado; 16 a 19 anos atualizado para explicitar alto nível no Brasil ou bolsas no exterior.

## Comparison history

### Iteration 1

- [P1] Rótulos e etapas se sobrepunham no desktop.
  - Fix: substituição da grade rígida de dez colunas por carrossel responsivo com cartões e scroll snap.
  - Post-fix evidence: quatro etapas aparecem integralmente no viewport e as demais ficam acessíveis por rolagem e controles.
- [P1] Fluxo institucional quebrava em caixas estreitas.
  - Fix: trilho horizontal de pills com largura intrínseca e rolagem.
  - Post-fix evidence: cada etapa mantém texto completo e área de toque de pelo menos 48 px.
- [P2] Não havia navegação explícita entre idades.
  - Fix: botões anterior/próximo, indicador “12 de 19 anos” e rolagem automática para a seleção.
  - Post-fix evidence: interação avançou de 12 para 13 anos e atualizou o painel; console sem erros.

## Interaction verification

- Botão “Próxima idade” avança a seleção e atualiza o detalhe.
- Dez etapas permanecem disponíveis no DOM e acessíveis por teclado.
- Nenhum erro de console na interação testada.
- Regras mobile incluem cards de até 72vw, snap horizontal, controles de 40 px e fluxo institucional rolável dentro do container.

## Findings

Nenhuma divergência P0, P1 ou P2 permanece no escopo da jornada.

## Follow-up polish

A emulação estreita do navegador integrado não aplicou o override abaixo de 1265 px nesta sessão; o breakpoint mobile foi validado por regras responsivas, typecheck e build, sem evidência visual adicional nesta rodada.

final result: passed

---

# QA complementar — Institucional, apoios, circuitos e loja

## Escopo validado

- Loja 11RUN e remoção da faixa abaixo do hero.
- Circuito Futuro 11 e destaque de estreia em 2027.
- Circuito Virtual 11RUN e premiações.
- Patrocínio, doação e voluntariado.
- Nova página Missão, Visão e Valores.
- Navegação institucional e menu móvel.

## Evidências

- Comparação lado a lado entre a captura de referência da loja e a implementação.
- Desktop em 1440 × 1000 e mobile em 375 × 812.
- Nenhum overflow horizontal nas sete rotas verificadas.
- Títulos sem estouro de largura.
- Menu móvel com rolagem própria e submenu institucional funcional.
- Arquivos das novas imagens respondendo com HTTP 200.
- Build de produção, typecheck e 15 testes automatizados aprovados.

## Resultado

- A faixa informativa da loja foi removida sem deixar espaço residual.
- O quarto benefício da loja mantém alinhamento e hierarquia dos demais cards.
- As novas imagens mantêm proporção e enquadramento adequados.
- A nova página institucional respeita o container, os tokens e a identidade do portal.

final result: passed

---

# Design QA — premiações e ranking gamificado do Circuito Virtual

## Evidências

- Referência do ranking: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-dd50f5ca-7894-4ae8-b547-6551f497786e.png`
- Referência das premiações: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-3923bcba-0fb3-41eb-9a38-af2a9a62c307.png`
- Implementação desktop do ranking: `.design/circuit-ranking-gamificado-desktop.png`
- Implementação mobile do ranking: `.design/circuit-ranking-gamificado-mobile.png`
- Implementação desktop das premiações: `.design/circuit-premiacoes-2026-desktop.png`
- Comparação lado a lado: `.design/circuit-ranking-source-vs-implementation.png`
- Viewports: 1440 × 1000 e 390 × 844 CSS px.

## Comparação visual e funcional

- O container central, tipografia, superfícies, bordas e espaçamentos seguem a identidade já existente do portal.
- O ranking preserva a hierarquia da referência e acrescenta somente os controles e dados solicitados: período, data e premiação atual.
- Os filtros Mensal, Trimestral e Total da edição alteram o intervalo consultado e mantêm uma indicação visual clara do estado selecionado.
- A tabela apresenta a data da melhor marca e os ícones de dinheiro, tênis, camiseta e troféu conforme a posição dentro de cada categoria.
- Os ícones possuem texto acessível e tooltip em foco/hover informando que a premiação é provisória.
- Desktop e mobile não apresentam overflow horizontal.
- No mobile, filtros, datas, marcas e premiações permanecem legíveis e operáveis sem sair do container.
- As três faixas de premiação — mensal, trimestral e final — exibem integralmente os critérios fornecidos.

## Findings

Nenhuma divergência P0, P1 ou P2 permanece no escopo solicitado. Os dados artificiais usados apenas na inspeção local foram removidos antes da publicação.

## Follow-up polish

Nenhum ajuste P3 é necessário para a entrega.

final result: passed

---

# Design QA — nova foto da home na pista

## Evidências

- Fonte: `D:/active projects/Z1 Elevenmind/11run/ayla/ayla web/JPEG/4.jpg`
- Referência do layout: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-01a8fd77-0610-4f57-b8b1-707daa37af64.png`
- Implementação desktop: `.design/home-ayla-pista-desktop.png`
- Implementação mobile: `.design/home-ayla-pista-mobile.png`
- Comparação lado a lado: `.design/home-ayla-pista-comparison.png`
- Viewports: 1440 × 900 e 390 × 844 CSS px.

## Verificações

- A nova imagem foi convertida para WebP em 1920 × 1080, com 168.606 bytes.
- O overlay escuro existente foi preservado e mantém contraste adequado no título, subtítulo e cards.
- O enquadramento central mantém a atleta visível em desktop e mobile.
- Navegação, conteúdo, links, cards e chat permanecem funcionais e sem alteração estrutural.
- `scrollWidth` e `clientWidth` coincidem nos dois breakpoints, sem overflow horizontal.

## Findings

Nenhuma divergência P0, P1 ou P2 foi encontrada no escopo da substituição da imagem.

## Follow-up polish

Nenhum ajuste P3 é necessário antes da publicação.

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

---

# Design QA — Admin sem barras internas e sem navegação pública

- Source visual truth: `.design/audits/admin-no-scroll-2026-08-03/01-reference-scrollbar.png` (868 × 949 px) e `.design/audits/admin-no-scroll-2026-08-03/01-reference-public-header.png` (2182 × 656 px).
- Implementation: `.design/audits/admin-no-scroll-2026-08-03/02-implementation-desktop.png` (1425 × 891 px) e `.design/audits/admin-no-scroll-2026-08-03/03-implementation-mobile.png` (390 × 844 px).
- CSS viewport: 1440 × 900 desktop e 390 × 844 mobile, device scale 1.
- State: `/admin`, visão geral; desktop em fluxo natural e gaveta mobile aberta.

## Comparação visual

- A sidebar mantém tipografia, cores, ícones, raios e hierarquia do design aprovado.
- No desktop, `overflow-y: visible` e `clientHeight === scrollHeight` (1325 px): não existe rolagem interna nem item cortado.
- No mobile, todos os itens continuam acessíveis por gesto, com `scrollbar-width: none` e WebKit scrollbar oculto.
- O cabeçalho, rodapé e assistente públicos retornam `display: none` somente quando `.admin-shell-page` está presente.
- Não existe overflow horizontal em desktop ou mobile.

## Superfícies obrigatórias

- **Tipografia:** família, pesos, tamanhos, entrelinhas e quebras preservados.
- **Espaçamento:** topo reduzido após a remoção do header; container e grid seguem o padrão central do portal.
- **Cores:** tokens existentes preservados, sem gradientes ou alterações de contraste.
- **Imagem e ícones:** nenhum raster foi alterado; ícones Lucide existentes permanecem nítidos.
- **Conteúdo:** nomes, descrições e 16 links administrativos preservados.

## Histórico de comparação

- P1 inicial: scrollbar interna visível e módulos inferiores escondidos. Corrigido removendo altura fixa e overflow no desktop.
- P1 inicial: navegação pública duplicada acima do painel. Corrigido ocultando o chrome público somente no contexto administrativo.
- Pós-correção: desktop e mobile capturados; gaveta mobile rolou de `0` a `507` sem barra visível; nova aba não registrou erros ou warnings no console.

## Findings

Nenhuma divergência P0, P1 ou P2 permanece.

## Follow-up polish

Nenhum ajuste P3 necessário para esta entrega.

final result: passed
# Design QA — Pipeline administrativo sem rolagem horizontal

- Data: 2026-08-03
- Fonte visual: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-61356a51-16ef-4455-a143-5641a30e8894.png`
- Implementação desktop: `C:/Users/User-PC/Documents/11run Portal 2/.design/audits/admin-pipeline-tabs-2026-08-03/implementation-1920x900.png`
- Implementação mobile: `C:/Users/User-PC/Documents/11run Portal 2/.design/audits/admin-pipeline-tabs-2026-08-03/implementation-mobile.png`
- Fonte: 1852 × 904 px, densidade 1x.
- Implementação desktop: 1425 × 891 px, viewport solicitado 1920 × 900 e superfície útil limitada pelo navegador integrado; comparação normalizada pelo container central de 1280 px, densidade 1x.
- Implementação mobile: 375 × 812 px, viewport CSS solicitado 390 × 844, densidade 1x.
- Estado: `/admin/cadastros`, todos os projetos, primeira etapa com registros selecionada.

**Comparação visual**

- A fonte e a implementação foram abertas juntas no mesmo passe de comparação.
- O problema P1 da referência — quinta coluna cortada e acesso às demais etapas dependente de scrollbar no rodapé — foi eliminado.
- As etapas agora formam uma grade de abas que quebra linha dentro do container; a etapa selecionada recebe contraste forte e os contadores permanecem visíveis.
- Os cadastros da etapa ativa usam uma grade responsiva, mantendo texto, controles e ações em largura legível.
- No mobile, as etapas formam duas colunas e o conteúdo passa para uma coluna, sem overflow horizontal.

**Superfícies de fidelidade**

- Tipografia: família, pesos e hierarquia existentes do portal preservados; rótulos das etapas permanecem legíveis sem truncamento.
- Espaçamento e ritmo: containers, raios, bordas e espaçamentos seguem os tokens administrativos; a navegação de etapas ganhou separação clara do conteúdo.
- Cores e tokens: somente variáveis existentes (`--surface`, `--surface-muted`, `--line`, `--text`, `--muted`, `--accent-strong`) foram usadas; nenhum degradê foi introduzido.
- Imagens e ícones: não houve substituição ou criação de ativos; fotos e ícones existentes foram preservados.
- Conteúdo: nomes das etapas, contagens, filtros e ações permanecem intactos; foi adicionado um estado vazio orientativo.

**Interações e responsividade verificadas**

- Troca entre `Cadastro recebido` e `Aceitos` atualiza o painel correspondente.
- A primeira etapa que contém registros é selecionada automaticamente.
- Desktop: `scrollWidth === clientWidth`; navegação de etapas com `overflow-x: visible` e sem barra horizontal.
- Mobile: `scrollWidth === clientWidth`; navegação de etapas e cards sem corte lateral.
- Menu público: `Circuito Virtual 11 2026` aparece antes de `Circuito 11 Run 2027` no menu Projetos e no rodapé.
- Console da captura final: nenhum erro ou aviso de runtime.

**Histórico de correção**

- P1 inicial: pipeline horizontal ocultava colunas e exigia deslocamento até o fim da página para acessar a scrollbar.
- Correção: substituição do quadro horizontal por abas de etapa com contadores e painel responsivo; boards administrativos secundários passaram a quebrar linha automaticamente.
- Evidência pós-correção: capturas desktop/mobile e métricas de largura acima, sem overflow horizontal.

**Findings**

- Nenhum P0, P1 ou P2 restante.

**Follow-up Polish**

- Nenhum item necessário para esta entrega.

final result: passed
