# Cross Country IVCL 11Run

- Página: `/circuito-cross-country-ivcl-11run`
- Inscrição: `/cadastro/circuito-cross-country-ivcl-11run` ou botão na página.
- Gestão: `/admin/cross-country`, sob a autenticação administrativa existente.
- Inscrições gratuitas até o fim de 12/11/2026 (São Paulo). Novos envios são bloqueados após o prazo; a edição administrativa permanece disponível.
- Primeira edição: 15/11/2026, IVCL, Campinas. Segunda e terceira: datas a confirmar.
- Programação atualizada pelo organizador em 05/10/2026: período único, das 8h às 10h. Masculino e feminino no mesmo horário em cada faixa.
- Largadas: 16 e 17 anos — 4 km às 8h; 14 e 15 anos — 3 km às 8h40; 12 e 13 anos — 2 km às 9h; 10 e 11 anos — 1 km às 9h20; 9 anos ou menos — 1 km às 9h35. Premiação geral às 9h45; foto geral e encerramento às 10h.
- Premiação atualizada: pódio dos três primeiros de cada categoria e gênero, com troféus e brindes 11Run.
- Diferenciais: transmissão pelo YouTube, fotos profissionais gratuitas após o evento e pontuação do ranking em tempo real no site.
- Logo e foto do hero fornecidos pelo organizador, otimizados em WebP. Enquadramento centralizado e adaptação para telas menores.

## Implementação

`src/app/circuito-cross-country-ivcl-11run/` contém página e estilos. `src/lib/circuit-categories.ts` reúne as cinco faixas de largada do Cross e o termo de participação. A classificação individual Sub 10 a Sub 18 é mantida, com Sub 10 incluindo 9 anos ou menos. O Circuito Futuro 11 mantém suas categorias e distâncias de pista na temporada de 2027.

As inscrições usam a tabela SQLite `leads`, com `project_type=circuito-cross-country-ivcl-11run`. Categoria e distância são calculadas no servidor pelo nascimento e pelo ano de 2026. Novas autorizações usam a versão `cross-2026-10-05.1`. Autorizações e dados históricos já armazenados são preservados; ao editar uma inscrição, categoria e distância são recalculadas pelas regras atuais. Não há migração destrutiva, alteração de marcas ou novos serviços.

`LeadForm.tsx`, `leads.ts` e `AdminPipeline.tsx` integram inscrição, validação e gestão. O painel permite busca, leitura, edição e mudança de status; as inscrições são apresentadas uma por linha. A edição compartilhada foi corrigida para enviar ao SQLite somente os parâmetros das colunas, mantendo os demais dados no JSON.

## Verificação

```sh
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Com o servidor local na porta 80 usando um **SQLITE_PATH descartável**, configure `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_BROWSER_PATH`, `ADMIN_USER` e `ADMIN_PASSWORD`, e execute `node tests/cross-country.browser.mjs`. Esse teste cria cadastros fictícios somente no servidor local: verifica inscrição, rejeições, edição, confirmação, persistência, categorias 2027 e overflow em 1440, 768 e 390 px. Nunca aponte esse teste para produção.

## Publicação

Usar o deploy Docker/CapRover existente, porta 80 e volume `/data` preservado. Após publicar, verificar página, formulário, `/api/health`, assets e proteção do admin. Os cadastros de teste ficam no banco local isolado, que não é versionado nem enviado.
