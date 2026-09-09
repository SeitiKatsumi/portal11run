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
