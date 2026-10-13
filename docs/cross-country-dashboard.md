# Dashboard das inscrições do Cross Country

Rota protegida: `/admin/cross-country`.

- Exibe atletas por categoria individual (Sub 10 a Sub 18), gênero e cidade/UF, com quantidade e percentual.
- Mostra o período de nascimento junto de cada categoria e no modal. O critério é a idade completada até 31/12/2026: Sub 10 para nascidos a partir de 01/01/2017; Sub 11 a Sub 18 correspondem aos anos completos de 2016 a 2009. A página pública, FAQ, regulamento e formulário usam a mesma referência em `circuit-categories.ts`, sem alterar os termos já aceitos e armazenados.
- Cada categoria abre um modal com os inscritos em ordem alfabética, separados em masculino e feminino, com contagens e cidade/UF. Registros sem gênero ficam em um grupo identificado, sem desaparecer dos totais. O modal respeita a etapa e a busca do dashboard; categorias vazias mostram o estado sem inscritos. Pode ser fechado pelo botão, Escape ou clique fora, com foco contido e devolvido à categoria.
- Por padrão acompanha a etapa selecionada. O seletor **Exibir no dashboard** permite considerar todas as etapas, incluindo declinados.
- A busca existente também filtra o dashboard. Cada inscrição corresponde a um atleta; não há deduplicação por nome.
- Mostra totais de atletas, inscrições aceitas e cidades informadas no recorte atual.
- Agrupa cidades ignorando caixa, acentos e UF repetida no campo cidade. Reconhece estados por sigla ou nome completo (SP/São Paulo). Municípios de estados diferentes permanecem separados. Dados ausentes continuam nos gráficos como **Não informado**.
- Mudanças salvas no cadastro recalculam os gráficos a partir do estado existente do pipeline, sem nova API, banco ou dependência.

## Validação

`pnpm test`, `pnpm build` e `pnpm lint`. Os testes de agregação ficam em `tests/cross-country-dashboard.test.mts`.

Conferir no navegador as etapas, a opção todas as etapas, a busca com e sem resultados, a atualização após editar uma inscrição e larguras de 1440, 768 e 390 pixels. A validação local usa SQLite separado com dados sintéticos; não cadastrar atletas de teste em produção.
