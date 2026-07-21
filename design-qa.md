# Design QA — Novas fotos do perfil de Alex Lopes

**Source visual truth**

- Página publicada antes da troca: `C:/Users/User-PC/Documents/11run Portal 2/.design/alex-before-top.png`
- Retrato fornecido pelo usuário: `D:/active projects/Z1 Elevenmind/alex/WhatsApp Unknown 2026-07-21 at 15.18.02/WhatsApp Image 2026-07-20 at 21.22.29.jpeg`

**Implementation evidence**

- Topo desktop: `C:/Users/User-PC/Documents/11run Portal 2/.design/alex-new-photos-after.png`
- Galeria desktop: `C:/Users/User-PC/Documents/11run Portal 2/.design/alex-gallery-after.png`
- Topo mobile: `C:/Users/User-PC/Documents/11run Portal 2/.design/alex-mobile-after.png`
- Comparação lado a lado: `C:/Users/User-PC/Documents/11run Portal 2/.design/alex-new-photos-comparison.jpg`
- Viewports: desktop padrão do navegador e mobile 390 × 844; estado público, tema claro.

**Findings**

- Nenhum P0, P1 ou P2 acionável permanece.
- Tipografia: família, pesos, escala, entrelinha e quebras permanecem iguais à landing anterior.
- Espaçamento e layout: a imagem nova ocupa o mesmo recorte do hero, sem deslocar textos, CTAs ou navegação; não há rolagem horizontal no desktop ou no mobile.
- Cores e tokens: a fotografia azul e branca cria contraste claro com o painel bege e preserva o acabamento existente, sem introduzir gradientes ou elementos artificiais.
- Qualidade de imagem: o retrato real está nítido, com o rosto e o uniforme enquadrados no desktop e no mobile; as cinco imagens foram convertidas para WebP e carregam com dimensões naturais válidas.
- Conteúdo: textos e ações existentes foram preservados; as cinco novas fotos aparecem no início da galeria com descrições acessíveis específicas.
- Acessibilidade: textos alternativos descrevem pessoas e contexto esportivo; o lightbox mantém abertura e fechamento funcionais e bloqueia corretamente o scroll de fundo.

**Primary interactions tested**

- Hero carregado com o novo retrato real e `naturalWidth` 853 / `naturalHeight` 1280.
- Galeria com 26 botões/imagens.
- Primeira imagem aberta no lightbox e fechada pelo botão.
- Corpo bloqueado durante o modal e liberado após o fechamento.
- Console verificado: nenhum erro.

**Focused region comparison evidence**

- O comparativo conjunto confirma que apenas o conteúdo fotográfico do hero mudou: a composição, a hierarquia, os CTAs e o recorte diagonal foram preservados.
- A captura da galeria confirma as quatro novas fotos de competição visíveis na primeira linha, com recortes coerentes e sem deformação.

**Comparison history**

1. Estado anterior: foto compartilhada com outra pessoa no hero e 21 imagens na galeria.
2. Implementação final: retrato profissional de Alex sozinho no hero e cinco novas fotos inseridas no início da galeria, totalizando 26.

**Implementation checklist**

- [x] Retrato real de Alex sozinho no topo.
- [x] Cinco novas fotos otimizadas em WebP.
- [x] Metadados Open Graph e Twitter atualizados.
- [x] Galeria e lightbox validados.
- [x] Responsividade desktop/mobile aprovada.
- [x] TypeScript e build de produção aprovados.

**Follow-up polish**

- Nenhum item bloqueante.

final result: passed
