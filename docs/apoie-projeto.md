# Área Apoie o Projeto

## Rotas públicas

- `/apoie`: hub institucional de apoio.
- `/apoie-o-projeto`: loja oficial preservada na URL existente.
- `/apoie/patrocine`: captação de patrocinadores.
- `/apoie/doacao`: doação via PIX.
- `/apoie/voluntariado`: cadastro de voluntários.

## Administração

O CRM unificado está em `/admin/apoios` e usa a mesma autenticação HTTP Basic das demais rotas administrativas. O painel permite filtrar contatos, atribuir responsável, atualizar etapas, registrar observações, abrir anexos privados, exportar CSV e configurar PIX, projetos e valores sugeridos.

## Persistência e arquivos

As tabelas são criadas de forma aditiva no SQLite configurado por `SQLITE_PATH`. Documentos e currículos ficam fora da pasta pública, em `SUPPORT_PRIVATE_UPLOAD_DIR`, e só podem ser lidos pela rota administrativa autenticada.

Em produção, mantenha `/data` em volume persistente no CapRover:

- `/data/portal11run.sqlite`
- `/data/uploads`
- `/data/virtual-circuit-private`
- `/data/support-private`

## Variáveis de ambiente

```env
SQLITE_PATH=/data/portal11run.sqlite
SUPPORT_PRIVATE_UPLOAD_DIR=/data/support-private
NEXT_PUBLIC_SITE_URL=https://11run.com.br
RESEND_API_KEY=
NOTIFICATION_FROM_EMAIL=11RUN <11run@elevenmind.com.br>
ADMIN_NOTIFICATION_EMAIL=
```

Sem `RESEND_API_KEY`, as notificações ficam registradas na tabela `support_notifications` como pendentes, sem interromper o cadastro. Para entrega automática, configure uma chave do Resend e um remetente verificado.

## PIX

O payload PIX é gerado no servidor com CRC16 e convertido em QR Code. A chave, o nome do recebedor e a cidade podem ser alterados em `/admin/apoios`. O nome e a cidade devem corresponder ao cadastro bancário da chave.

## Segurança

- Rate limiting por IP nas APIs públicas.
- Campo honeypot invisível contra robôs.
- Consentimento obrigatório de privacidade.
- Validação de extensão, MIME, assinatura e limite de 10 MB para arquivos.
- Anexos armazenados fora de `public`.
- APIs administrativas protegidas pelo middleware existente.

## Verificação

```powershell
node --experimental-strip-types --test --test-reporter=dot tests/*.test.mts
node node_modules/next/dist/bin/next build
docker build -t 11run-portal .
```
