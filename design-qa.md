# Design QA — Submenu Institucional

**Source visual truth**

- `C:/Users/User-PC/Documents/11run Portal 2/.design/institutional-submenu-reference.png`
- A anotação solicita mover Seiti Katsumi e Alex Lopes para um submenu lateral de “Profissionais”.

**Implementation evidence**

- Desktop/foco aberto: `C:/Users/User-PC/Documents/11run Portal 2/.design/institutional-submenu-desktop.png`
- Mobile/accordion aberto: `C:/Users/User-PC/Documents/11run Portal 2/.design/institutional-submenu-mobile.png`
- Comparação lado a lado: `C:/Users/User-PC/Documents/11run Portal 2/.design/institutional-submenu-comparison.jpg`
- Viewports: 1265 px desktop e 375 px mobile; estado público, tema claro.

**Findings**

- Nenhum P0, P1 ou P2 acionável permanece.
- Tipografia: escala, caixa-alta, peso e espaçamento seguem os tokens existentes do cabeçalho.
- Layout: “Profissionais” ocupa o primeiro painel e o segundo painel abre lateralmente à direita, como indicado na referência.
- Cores: superfícies, bordas, sombra e estados de foco preservam a identidade atual, sem gradientes.
- Ícones: ChevronRight e UserRound pertencem à biblioteca já usada pelo produto e mantêm peso consistente.
- Conteúdo: Seiti Katsumi e Alex Lopes permanecem com as rotas públicas corretas.
- Acessibilidade: submenu desktop funciona por hover e `focus-within`, usa `aria-haspopup`, `menu` e `menuitem`; mobile usa `details/summary` nativo.
- Responsividade: mobile transforma o flyout em accordion; 375 px sem rolagem horizontal.

**Primary interactions tested**

- Institucional aberto por foco.
- Profissionais aberto por foco, exibindo o painel lateral.
- Accordion Profissionais aberto no mobile, exibindo os dois links.
- Console verificado: sem erros ou avisos.

**Focused region comparison evidence**

- A comparação conjunta mostra os links saindo do painel original e aparecendo no flyout direito, preservando dimensões, raio, cores e hierarquia do menu existente.

**Comparison history**

1. Referência: Seiti e Alex estavam no mesmo painel, com indicação para movê-los à direita.
2. Implementação final: Profissionais virou o gatilho; os dois profissionais aparecem em painel lateral e, no mobile, em accordion.

**Implementation checklist**

- [x] Submenu lateral desktop.
- [x] Navegação por hover e teclado/foco.
- [x] Accordion mobile.
- [x] Rotas dos profissionais preservadas.
- [x] TypeScript e build de produção aprovados.
- [x] QA visual desktop/mobile aprovado.

**Follow-up polish**

- Nenhum item bloqueante.

final result: passed
