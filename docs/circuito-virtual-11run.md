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
