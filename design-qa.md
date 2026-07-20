# Design QA — slider da família, CTA e painel do Alex

## Evidências

- Fonte visual — seção dos filhos: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-ef96f22e-ade3-4ade-a133-5cf025d3bf88.png`
- Fonte visual — posição do CTA: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-95984d2a-92b0-43dc-a348-61c005689328.png`
- Fonte visual — painel quebrado: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-71a675c8-1cd5-421d-bc22-2dbf2e6cc7be.png`
- Fonte visual — link administrativo a remover: `C:/Users/User-PC/AppData/Local/Temp/codex-clipboard-b2a17d0e-7aaa-4ee4-8c79-13bff80eeeb8.png`
- Implementação: `.design/qa-seiti-family-slider.png`, `.design/qa-alex-hero-cta-final.png`, `.design/qa-alex-admin-fixed-final.png`
- Comparações combinadas: `.design/compare-seiti-slider.png`, `.design/compare-alex-cta.png`, `.design/compare-alex-admin.png`
- Viewport do navegador: 1265 × 710, desktop.
- Estados: primeiro e segundo slides; CTA e modal; envio confirmado; painel vazio, lista e detalhe selecionado.

## Comparação da visão completa

As capturas foram normalizadas lado a lado porque as referências vieram de monitores com dimensões diferentes. A estrutura original dos cards foi preservada. O slider ocupa o mesmo espaço da imagem anterior, o CTA foi acrescentado ao grupo de ações existente e o painel voltou ao grid centralizado do sistema.

## Comparação focada

- Slider: seis imagens WebP carregadas, fotografia inteira preservada com `object-fit: contain`, legenda dinâmica, setas, contador e indicadores.
- CTA: “Treine com o Alex” aparece no hero com a cor verde institucional e abre o modal centralizado existente.
- Formulário: envio multipart concluído, confirmação visível e console limpo.
- Painel: duas colunas no desktop, lista e detalhe dentro do limite de 1280 px, sem overflow horizontal; seleção do cadastro funciona.
- Navegação administrativa: “Trajetória Seiti/Orcampi” não aparece mais.

## Findings

Nenhum P0, P1 ou P2 permanece.

- Fontes e tipografia: hierarquia e pesos existentes foram preservados; novo CTA usa a mesma tipografia e escala dos demais botões.
- Espaçamento e ritmo: slider mantém a proporção 4:5; painel recuperou margens, padding, alinhamento e grid consistentes.
- Cores e tokens: marfim, carvão, verde e linhas existentes foram reutilizados; nenhum degradê foi introduzido.
- Qualidade das imagens: as seis fotos fornecidas foram convertidas para WebP com dimensões originais preservadas e sem ampliação artificial.
- Copy e conteúdo: legendas descrevem Luhan, Aimê e a continuidade da trajetória; CTA e estados administrativos estão em português.
- Acessibilidade: slider aceita setas do teclado, swipe, botões rotulados, pausa em foco/hover e respeita `prefers-reduced-motion`.

## Histórico de correções

1. P1 — painel administrativo sem estilos e fora do container: corrigido com `admin-panel`, grid responsivo e estilos globais específicos. Evidência final sem overflow.
2. P1 — envio salvo, mas confirmação quebrava no navegador: a referência do formulário passou a ser preservada antes do `await`. Reenvio final exibiu confirmação e console sem erros.
3. P1 — formulários do Alex fora do volume persistente: armazenamento direcionado ao diretório do `SQLITE_PATH`, que é `/data` no CapRover, com escrita atômica.
4. P2 — campos com nomes divergentes eram descartados pela API: mapeamento alinhado ao formulário e áudio opcional passou a ser salvo com validação de tipo e limite de 15 MB.
5. P2 — imagem estática não representava os filhos: substituída por slider funcional com as seis fotos fornecidas.
6. P2 — link administrativo redundante: removido do menu sem excluir a rota pública institucional.

## Checklist

- [x] TypeScript sem erros
- [x] Build otimizado do Next.js aprovado
- [x] Seis imagens carregadas e navegação do slider exercitada
- [x] CTA abre o formulário correto
- [x] Envio cria cadastro e apresenta confirmação
- [x] Cadastro aparece e abre no painel administrativo
- [x] Console final sem erros
- [x] Sem overflow horizontal no desktop
- [x] Regras responsivas revisadas para 900 px e 620 px

## Follow-up polish

Nenhum refinamento visual bloqueante.

final result: passed
