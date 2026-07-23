# Portal 11RUN

Portal institucional oficial do ecossistema 11RUN Brazil, com páginas internas para App 11Run, Onze Futuro, 11 Master, Circuito Futuro 11 e Bolsas/Oportunidades.

## Stack

- Next.js App Router
- React + TypeScript
- Framer Motion
- Lucide Icons
- Banco de dados SQLite persistente para leads
- Loja com catálogo, estoque por tamanho, pedidos e Stripe Checkout
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

## Loja e Stripe

A página `/apoie-o-projeto` funciona como loja oficial. Produtos e estoque são gerenciados em `/admin/loja`.

O carrinho oferece entrega nacional com frete fixo de R$ 19,90 ou retirada gratuita com atletas em Americana,
Campinas, Itatiba, Mogi Mirim e Recife. A modalidade e a cidade escolhidas ficam registradas no pedido.

Configure no CapRover, sem gravar chaves no GitHub:

```txt
NEXT_PUBLIC_SITE_URL=https://11run.com.br
STRIPE_SECRET_KEY=rk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Cadastre no Stripe Workbench o webhook:

```txt
https://11run.com.br/api/stripe/webhook
```

Eventos necessários:

```txt
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
```

Os meios de pagamento são dinâmicos e devem ser ativados no Dashboard da Stripe. O código não restringe o checkout a cartão.

Se `11run.com.br` mostrar `Nothing here yet`, o domínio ainda está no placeholder/default do CapRover ou não foi salvo no app correto. A porta do container deste projeto é sempre `80`.

Para persistir leads em produção no CapRover, configure um diretório persistente com:

```txt
Caminho no App: /data
Caminho no Host: gerenciado pelo CapRover
```

O container usa `SQLITE_PATH=/data/portal11run.sqlite`, então o banco fica preservado entre deploys.

As avaliações enviadas pelo formulário “Treine com o Alex” ficam disponíveis em `/admin/alex-lopes` e são persistidas em `/data/alex-lopes-applications.json`. Áudios opcionais são armazenados no diretório configurado por `UPLOAD_DIR` (`/data/uploads` no container).
