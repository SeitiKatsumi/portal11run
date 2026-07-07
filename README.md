# Portal 11RUN

Portal institucional oficial do ecossistema 11RUN Brazil, com páginas internas para App 11Run, Onze Futuro, 11 Master, Circuito Futuro 11 e Bolsas/Oportunidades.

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

O endpoint `POST /api/leads` valida campos obrigatórios e salva cada cadastro no SQLite:

```txt
data/portal11run.sqlite
```

Para alterar o local:

```bash
SQLITE_PATH=/caminho/para/portal11run.sqlite
```

O arquivo `data/schema.sql` contém a estrutura da tabela `leads`.

## Formulários

- `/cadastro/app-11run`
- `/cadastro/onze-futuro`
- `/cadastro/11-master`
- `/cadastro/circuito-futuro-11`
- `/cadastro/bolsas`

Após envio com sucesso, o usuário é redirecionado para `/obrigado`.

## Assets

Os assets usados pelo portal ficam em:

```txt
public/assets/11run.png
public/assets/logos/
```

Se for trocar logos ou imagens, mantenha os nomes atuais ou ajuste as referências em `src/lib/content.ts`.

## CapRover

O projeto já inclui:

- `Dockerfile`
- `docker-compose.yml`
- `captain-definition`

No CapRover, crie o app, conecte o repositório e faça deploy usando o `captain-definition`.

Configurações importantes no CapRover:

```txt
Porta HTTP do Container: 80
Diretório Persistente - Caminho no App: /data
Variável de ambiente: SQLITE_PATH=/data/portal11run.sqlite
```

Healthcheck do app:

```txt
/api/health
```

Se `11run.com.br` mostrar `Nothing here yet`, o domínio ainda está no placeholder/default do CapRover ou não foi salvo no app correto. A porta do container deste projeto é sempre `80`.

Para persistir leads em produção no CapRover, configure um diretório persistente com:

```txt
Caminho no App: /data
Caminho no Host: gerenciado pelo CapRover
```

O container usa `SQLITE_PATH=/data/portal11run.sqlite`, então o banco fica preservado entre deploys.
