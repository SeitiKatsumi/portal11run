# Dashboard das inscrições do Cross Country

Rota protegida: `/admin/cross-country`.

- Exibe atletas por categoria individual (Sub 10 a Sub 18), gênero e cidade/UF, com quantidade e percentual.
- Por padrão acompanha a etapa selecionada. O seletor **Exibir no dashboard** permite considerar todas as etapas, incluindo declinados.
- A busca existente também filtra o dashboard. Cada inscrição corresponde a um atleta; não há deduplicação por nome.
- Mostra totais de atletas, inscrições aceitas e cidades informadas no recorte atual.
- Agrupa cidades ignorando caixa, acentos e UF repetida no campo cidade. Municípios de estados diferentes permanecem separados. Dados ausentes continuam nos gráficos como **Não informado**.
- Mudanças salvas no cadastro recalculam os gráficos a partir do estado existente do pipeline, sem nova API, banco ou dependência.

## Validação

`pnpm test`, `pnpm build` e `pnpm lint`. Os testes de agregação ficam em `tests/cross-country-dashboard.test.mts`.

Conferir no navegador as etapas, a opção todas as etapas, a busca com e sem resultados, a atualização após editar uma inscrição e larguras de 1440, 768 e 390 pixels. A validação local usa SQLite separado com dados sintéticos; não cadastrar atletas de teste em produção.
