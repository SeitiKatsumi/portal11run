# Olympic Pathway Intelligence — OCI 1.0.0

## Finalidade

A rota `/referencias/calculadoras/chance-olimpica` produz uma leitura educativa de compatibilidade histórica. Ela não calcula uma probabilidade individual de participação olímpica, não diagnostica talento e não seleciona atletas.

## Motor determinístico

1. O parser compartilhado converte a marca em segundos.
2. Cada adapter consulta a camada interna já usada pelos rankings do portal; a página não raspa HTML.
3. A marca é inserida de forma hipotética em cada lista disponível.
4. O percentil da posição recebe um peso conforme o alinhamento da categoria: idade exata, faixa de dois anos, série escolar, Sub-18, Sub-20 ou adulto.
5. A média ponderada é arredondada e exibida como **compatibilidade histórica**, nunca como probabilidade.
6. Fontes com menos de cinco marcas não participam do índice. Ausência de fontes retorna `null`, nunca `0%`.

Pesos e versão ficam em `src/lib/olympic-pathway/core.ts`. Toda alteração metodológica deve incrementar `OLYMPIC_PATHWAY_VERSION` e acrescentar testes de regressão.

## Fontes

- Brasil: snapshots CBAt da camada interna.
- Estados Unidos: ranking juvenil unificado interno USATF/AAU.
- Japão: snapshots escolares publicados no portal.
- Noruega: snapshots Min Friidrettsstatistikk.
- Quênia, Uganda e Mundial: snapshots World Athletics.

As categorias não são tratadas como equivalentes. Fonte vazia, desatualizada ou incompatível aparece como indisponível e não participa do cálculo.

## Privacidade

O formulário não solicita nome, nascimento completo, cidade, escola, equipe ou saúde. A primeira versão processa os dados de forma efêmera e não salva análises. O endpoint possui validação server-side e rate limit. Nenhum resultado individual deve ser enviado a analytics ou marketing.

## Limitações conhecidas

- desempenho juvenil tem baixa capacidade preditiva sobre desempenho adulto;
- posições são simuladas sobre o recorte interno disponível e não são homologações;
- a versão 1.0.0 não oferece probabilidade longitudinal calibrada;
- a seleção olímpica depende de regras do ciclo, índices, ranking mundial e limites por país;
- 3.000 m rasos é tratado como referência para rotas de 1.500 m e 5.000 m.

## Atualização

Atualize primeiro os rankings pelas rotinas existentes. Depois, ajuste pesos apenas com justificativa documentada, incremente a versão, execute `pnpm test`, `pnpm typecheck`, `pnpm lint` e `pnpm build`.
