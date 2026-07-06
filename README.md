# Portal 11RUN

Portal institucional oficial do ecossistema 11RUN Brazil, com pÃ¡ginas internas para App 11Run, Onze Futuro, 11 Master, Circuito Futuro 11 e Bolsas/Oportunidades.

## Stack

- Next.js App Router
- React + TypeScript
- Framer Motion
- Lucide Icons
- Banco de dados SQLite persistente para leads
- Docker e CapRover

## Rodar localmente

```bash
pnpm install
pnpm dev
```

Abra `http://localhost:3000`.

## Build

```bash
pnpm build
pnpm start
```

## Banco de dados e leads

O endpoint `POST /api/leads` valida campos obrigatÃ³rios e salva cada cadastro no SQLite:

```txt
data/portal11run.sqlite
```

Para alterar o local:

```bash
SQLITE_PATH=/caminho/para/portal11run.sqlite
```

O arquivo `data/schema.sql` contÃ©m a estrutura da tabela `leads`.

## FormulÃ¡rios

- `/cadastro/app-11run`
- `/cadastro/onze-futuro`
- `/cadastro/11-master`
- `/cadastro/circuito-futuro-11`
- `/cadastro/bolsas`

ApÃ³s envio com sucesso, o usuÃ¡rio Ã© redirecionado para `/obrigado`.

## Assets

Os assets usados pelo portal ficam em:

```txt
public/assets/11run.png
public/assets/logos/
```

Se for trocar logos ou imagens, mantenha os nomes atuais ou ajuste as referÃªncias em `src/lib/content.ts`.

## CapRover

O projeto jÃ¡ inclui:

- `Dockerfile`
- `docker-compose.yml`
- `captain-definition`

No CapRover, crie o app, conecte o repositÃ³rio e faÃ§a deploy usando o `captain-definition`.

ConfiguraÃ§Ãµes importantes no CapRover:

```txt
Porta HTTP do Container: 80
DiretÃ³rio Persistente - Caminho no App: /data
VariÃ¡vel de ambiente: SQLITE_PATH=/data/portal11run.sqlite
```

Healthcheck do app:

```txt
/api/health
```

Se `11run.com.br` mostrar `Nothing here yet`, o domÃ­nio ainda estÃ¡ no placeholder/default do CapRover ou nÃ£o foi salvo no app correto. A porta do container deste projeto Ã© sempre `80`.

Para persistir leads em produÃ§Ã£o no CapRover, configure um diretÃ³rio persistente com:

```txt
Caminho no App: /data
Caminho no Host: gerenciado pelo CapRover
```

O container usa `SQLITE_PATH=/data/portal11run.sqlite`, entÃ£o o banco fica preservado entre deploys.
