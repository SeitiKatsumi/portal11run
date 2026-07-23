# Diretrizes do Portal 11RUN

## Regra estrutural obrigatória

- Toda página, painel, formulário, loja, dashboard ou nova seção deve permanecer dentro do container central do portal.
- Reutilize `--max`, `.admin-panel` ou o shell equivalente já existente. No desktop, a referência é `width: min(calc(100% - 48px), var(--max))`; no mobile, `width: min(calc(100% - 28px), var(--max))`.
- Cabeçalho, navegação, conteúdo principal e rodapé devem compartilhar alinhamento, margens, raios, cores, tipografia e ritmo de espaçamento.
- Não crie conteúdo full width/full bleed sem solicitação explícita.
- Antes de publicar, valide visualmente desktop e mobile, confira overflow horizontal e compare a nova área com uma página existente do site.
