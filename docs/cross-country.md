# Cross Country IVCL 11Run

- Página: `/circuito-cross-country-ivcl-11run`
- Inscrição: `/cadastro/circuito-cross-country-ivcl-11run` ou botão na página.
- Gestão: `/admin/cross-country`, sob a autenticação administrativa existente.
- Inscrições gratuitas até o fim de 12/11/2026 (São Paulo). Novos envios são bloqueados após o prazo; a edição administrativa permanece disponível.
- Primeira edição: 15/11/2026, IVCL, Campinas. Segunda e terceira: datas a confirmar.
- Fonte de categorias e programação: `Circuito de Fundo  - IVCL 11RunBrazil.docx` fornecido pelo organizador.
- Largadas confirmadas pelo organizador: Sub 10 + Sub 11; Sub 12 + Sub 13; Sub 14 + Sub 15; Sub 16 + Sub 17 + Sub 18. Distâncias mantidas, feminino e masculino separados. O Sub 14 está nos horários do grupo Sub 14 + Sub 15 nos dois períodos.
- Premiação atualizada: pódio dos três primeiros de cada categoria e gênero, com troféus e brindes 11Run.
- Diferenciais: transmissão pelo YouTube, fotos profissionais gratuitas após o evento e pontuação do ranking em tempo real no site.
- Logo e foto do hero fornecidos pelo organizador, otimizados em WebP. Enquadramento centralizado e adaptação para telas menores.

## Implementação

`src/app/circuito-cross-country-ivcl-11run/` contém página e estilos. `src/lib/circuit-categories.ts` reúne as nove categorias e o termo de participação. O Circuito Futuro 11 usa as mesmas categorias, mantendo sua temporada de 2027.

As inscrições usam a tabela SQLite `leads`, com `project_type=circuito-cross-country-ivcl-11run`. Categoria e distância são calculadas no servidor pelo nascimento e pelo ano de 2026. A autorização é armazenada com versão e conteúdo. Não há migração destrutiva, alteração de marcas ou novos serviços.

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
