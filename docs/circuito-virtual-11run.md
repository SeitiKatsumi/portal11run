# Circuito Virtual 11Run

## Entrega da Fase 1

A Fase 1 funciona sem IA, Strava, e-mail ou WhatsApp: a inscrição é recebida, o documento fica privado, a atividade entra em revisão humana, o administrador registra uma decisão auditável e somente marcas aprovadas aparecem no ranking.

Rotas principais:

- Pública: `/projetos/circuito-virtual-11run`
- Responsável: `/projetos/circuito-virtual-11run/acompanhamento`
- Administração: `/admin/circuito-virtual`
- Documento privado: `/api/admin/circuito-virtual/files/:id`

## Variáveis obrigatórias

- `ADMIN_USER` e `ADMIN_PASSWORD`: protegem o painel e APIs administrativas.
- `SQLITE_PATH`: banco persistente.
- `VIRTUAL_CIRCUIT_PRIVATE_UPLOAD_DIR`: diretório persistente, fora de `public`.
- `VIRTUAL_CIRCUIT_DATA_KEY`: segredo longo usado por AES-256-GCM e HMAC para CPF e datas sensíveis.

O volume `/data` precisa ser persistente no CapRover. Faça backup consistente do arquivo SQLite e do diretório privado.

## Migração e seed

As tabelas são idempotentes e estão em `data/schema.sql`. A primeira inicialização cria a edição 2026 com regulamento, FAQ, categorias de 9 a 13 anos e premiações padrão.

## Deploy

1. Configure as variáveis no CapRover.
2. Confirme que `/data` está persistente.
3. Faça deploy da branch/commit.
4. Verifique `/api/health`, a página pública, uma inscrição de teste e a fila administrativa.

## Rollback

O rollback do container não remove as tabelas. Para voltar a aplicação, selecione a imagem anterior no CapRover. Preserve o banco e os uploads; não apague as novas tabelas enquanto houver inscrições.

## Integrações externas pendentes (Fase 2)

- OAuth e streams do Strava.
- Provedor de IA para resultados oficiais e análise assistida de vídeo.
- Fila externa para jobs assíncronos.
- E-mail e WhatsApp transacionais.
- Antivírus de upload e CAPTCHA gerenciado.

Sem essas integrações, o registro `MANUAL_FALLBACK` mantém o fluxo operacional e nenhuma rejeição automática é feita.

## Identidade e evolução — setembro de 2026

A edição encerra em 14/11/2026 (São Paulo). Datas reais fora de 01/08–14/11 permanecem no histórico e não entram nas classificações. Não reconstruímos datas antigas sem backup ou auditoria com a data original.

A migração em `src/lib/virtual-circuit-identity.ts` acrescenta uma tabela de identidades numéricas e vínculos nas tabelas existentes. Cada cadastro público mantém seu UUID, CPF, responsável e documentos. Marcas manuais legadas recebem identidades separadas, pendentes de revisão; nomes nunca são unidos automaticamente. A migração é transacional e repetível. Antes das alterações, salva `before.sqlite` por VACUUM INTO e copia os uploads privados em `backups/circuit-*`, junto ao banco. Falha no backup impede a migração. Esses arquivos não vão ao GitHub.

No admin, abra **Atletas**, selecione o histórico e confirme cada vínculo. Vincular cadastro público move todas as marcas daquele cadastro; não une dois CPFs distintos. Números antigos permanecem disponíveis para corrigir vínculos. O nome público, categoria e gênero são editados no perfil; a edição de marca não muda status ou modalidade.

**Adicionar em lote:** cole colunas separadas por tabulação, com cabeçalho opcional: nome, idade em 2026 (9–13), gênero (F/M), data (DD/MM/AAAA ou AAAA-MM-DD), tempo (MM:SS.CC), cidade, UF, modalidade (pista/livre/oficial), competição/teste, número opcional. Revise a identidade de cada linha, escolhendo atleta existente, outra linha anterior ou nova pessoa. O limite é 500 marcas. Erros não salvam parte do lote; a chave de operação torna tentativas repetidas idempotentes.

APIs autenticadas: GET/PATCH `/api/admin/circuito-virtual/athletes`, POST `/api/admin/circuito-virtual/batch`. A consulta pública de ranking aceita `mode=evolution`, além dos filtros existentes. O número é adicional aos IDs originais. A evolução usa a melhor marca do primeiro dia e a melhor posterior, em duas datas distintas, com percentual mínimo de zero. O ranking de evolução não altera a premiação por tempo.

Validação: `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`. No Windows com diretório redirecionado, executar o Next pelo caminho físico do projeto evita erros de resolução de caminhos. Em produção, Docker mantém porta 80 e `/data` persistente.

Antes do deploy, registrar contagens e imagem atual. Depois, conferir integridade, contagens, rankings e logs da migração. Para recuperação, manter o backup e a imagem anterior; não reativar cegamente uma imagem antiga, pois o seed anterior sobrescrevia marcas. Suspender gravações e preservar também as atividades recebidas após a publicação antes de qualquer restauração do banco.

## Apresentação do circuito — 9 de setembro de 2026

- “Últimos participantes” considera a inclusão mais recente de uma marca aprovada, de origem pública ou administrativa, agrupada pelo número permanente. Data da atividade, melhor tempo e edição do registro não determinam essa ordem.
- Números aparecem como `Nº 001`, sem modificar os IDs armazenados.
- Cada quadro de líderes apresenta Sub 10 a Sub 14, com feminino antes do masculino e indicação de ausência de marca validada.
- O gráfico mostra a variação percentual de cada marca em relação à referência: melhorias sobem e pioras permanecem negativas. Botões dos atletas alternam linhas; os pontos mostram tempo e percentual. A tabela acessível contém os mesmos valores.

Verificação: `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`. No circuito público, conferir os três quadros de líderes e tocar nos atletas/pontos do gráfico. No admin, conferir a numeração nas marcas, atletas e opções de vínculo. Esta atualização não migra nem altera dados.

## Seleção de atletas e comprovação em pista — regulamento 1.3

A seleção de atleta existente preenche categoria e gênero no cadastro de marca e no lote. Na inclusão individual, esses campos ficam protegidos enquanto houver vínculo; a edição da identificação usa opções Feminino/Masculino. A validação do servidor permanece ativa.

O regulamento 1.3 exige 1.000 m pelas marcações oficiais da pista de 400 m (duas voltas e meia na raia 1), sem aceitar GPS como medição em pista. Prêmios bimestrais e em dinheiro exigem teste em pista oficial com vídeo integral ou competição oficial com resultado verificável, sujeito a homologação. Resultados e aceites anteriores são preservados.

`CircuitTrackGuide.tsx` contém a ilustração vetorial com animação iniciada pelo usuário, pausa, reinício e controle de percurso. Não usa imagens pesadas nem dependências novas.

Além de `pnpm test`, `pnpm lint`, `pnpm typecheck` e `pnpm build`, executar `node tests/circuit-athlete-selection.browser.mjs` com o servidor local na porta 80 e cópia descartável do SQLite. Definir `ADMIN_USER`, `ADMIN_PASSWORD`, `PLAYWRIGHT_MODULE` (instalação disponível do Playwright) e `PLAYWRIGHT_BROWSER_PATH`. A regressão verifica seleção, gravação vinculada, lote, regulamento, animação e responsividade; remove a marca criada ao terminar.

## Histórico individual no gráfico

O destaque padrão continua mostrando as cinco maiores evoluções. O seletor “Atleta no gráfico” permite consultar qualquer atleta do período, incluindo os demais colocados, evolução zero e uma única data (sem comparação). Todas as marcas aprovadas são exibidas, inclusive múltiplas marcas no mesmo dia; a referência permanece a melhor marca do primeiro dia.

Regressão: `node tests/circuit-chart-selection.browser.mjs`, com servidor local na porta 80 e as variáveis de Playwright descritas acima. A verificação usa respostas simuladas apenas para o ranking de evolução e não grava dados.

## Vinte evoluções e confirmação de vínculo

O gráfico destaca até vinte atletas com evolução positiva, com linhas de 1,5 px, pontos menores e legenda em grade. A consulta individual continua disponível. Histórico, tabela e detalhes dos pontos identificam a modalidade e o nome da competição/teste; a origem administrativa não é confundida com a modalidade.

“Confirmar vínculo atual” grava a confirmação e mostra o resultado junto à atividade. Alterações para outro atleta usam confirmação inline, com retorno de erro ou sucesso visível e preservação das validações do servidor.

## Pista de oito raias — 10 de setembro de 2026

Ilustração corrigida: largada na referência dos 200 m da raia 1, chegada comum ao final da reta dos 100 m, extensão da reta de velocidade e oito raias numeradas. O percurso laranja e o marcador animado permanecem na raia 1. A figura é esquemática e não substitui as marcações oficiais do local.

Referência: plano de marcações da pista padrão de 400 m da World Athletics, disponível em https://worldathletics.org/about-iaaf/documents/technical-information . A regressão de navegador verifica nove limites formando oito raias, posição inicial e chegada após 1.000 m. Nenhum registro do circuito é alterado.
