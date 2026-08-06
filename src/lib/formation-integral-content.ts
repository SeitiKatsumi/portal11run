export const formationPillars = [
  { title: "Corpo e saúde", text: "Treinar, recuperar, reconhecer sensações e comunicar dor ou desconforto." },
  { title: "Educação", text: "Aprender, organizar a rotina e preservar o vínculo com a escola durante toda a formação." },
  { title: "Autonomia", text: "Participar progressivamente das decisões adequadas à idade, com direção e proteção adulta." },
  { title: "Pensamento crítico", text: "Fazer perguntas, avaliar fontes e não transformar redes sociais, suplementos ou IA em autoridade." },
  { title: "Identidade", text: "Construir relações, interesses e projetos que não dependam exclusivamente do resultado esportivo." },
  { title: "Projeto de vida", text: "Enxergar alto rendimento, estudo e outros futuros como caminhos que podem coexistir." }
] as const;

export const autonomySteps = [
  ["Escutar", "Receber explicações simples sobre o treino e saber quem procurar quando algo não vai bem."],
  ["Compreender", "Relacionar esforço, descanso, escola, alimentação e evolução sem precisar dominar termos técnicos."],
  ["Comunicar", "Dizer o que sentiu, fazer perguntas e relatar uma situação insegura sem medo de punição."],
  ["Participar", "Contribuir em escolhas proporcionais à idade, enquanto adultos mantêm responsabilidade e proteção."],
  ["Decidir com apoio", "Avaliar caminhos, consequências e fontes junto à família e à equipe multidisciplinar."]
] as const;

export const decisionScenarios = [
  { title: "Prova e avaliação no mesmo dia", prompt: "Qual é a primeira atitude responsável?", choices: ["Esconder o conflito até a véspera", "Conversar cedo com escola, família e equipe", "Abandonar automaticamente uma das atividades"], answer: 1, feedback: "Planejamento antecipado permite buscar alternativas reais sem prometer flexibilizações que ainda não estejam disponíveis." },
  { title: "Dor persistente no treino", prompt: "O que protege melhor o atleta?", choices: ["Continuar para mostrar disciplina", "Pedir conselho a um perfil de rede social", "Comunicar a dor e buscar avaliação apropriada"], answer: 2, feedback: "Ter voz também é proteção. Dor não deve ser silenciada nem interpretada por sistemas automáticos." },
  { title: "Suplemento indicado por influenciador", prompt: "Como aplicar pensamento crítico?", choices: ["Verificar fonte, risco antidopagem e orientação profissional", "Comprar porque outros atletas usam", "Confiar no número de seguidores"], answer: 0, feedback: "Popularidade não substitui evidência, necessidade individual, procedência e responsabilidade profissional." }
] as const;

export const formationReferences = [
  { id: "lei-geral-esporte", title: "Lei Geral do Esporte", institution: "Presidência da República", year: 2023, category: ["formação integral", "políticas brasileiras"], type: "Lei", summary: "Relaciona formação esportiva a ações educativas, desenvolvimento integral, autodeterminação e conciliação entre educação e treinamento.", limitations: "A aplicação concreta depende de regulamentação, políticas e estruturas institucionais.", url: "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14597.htm" },
  { id: "plano-dupla-carreira", title: "Plano de apoio à transição e à dupla carreira esportiva", institution: "Ministério do Esporte", year: 2025, category: ["dupla carreira", "políticas brasileiras"], type: "Plano oficial", summary: "Diagnostica conflitos entre estudo e esporte e propõe coordenação, flexibilidade e metas nacionais.", limitations: "Muitas medidas são propostas estratégicas; não constituem direitos automáticos em todas as escolas.", url: "https://www.gov.br/esporte/pt-br/acoes-e-programas-1/acoes-e-programas/plano-de-acao-estrategico-para-apoio-a-transicao-e-a-dupla-carreira-esportiva.pdf/@@display-file/file" },
  { id: "bncc", title: "Base Nacional Comum Curricular", institution: "Ministério da Educação", year: 2018, category: ["educação", "projeto de vida"], type: "Diretriz educacional", summary: "Associa educação a autonomia intelectual, pensamento crítico, responsabilidade, corpo e projeto de vida.", limitations: "É uma referência curricular ampla, não um protocolo específico para atletas.", url: "https://basenacionalcomum.mec.gov.br/" },
  { id: "wanzeler", title: "Facilitadores e barreiras para a dupla carreira do estudante-atleta", institution: "Revista Brasileira de Ciências do Esporte", year: 2023, category: ["dupla carreira", "Brasil"], type: "Revisão integrativa", summary: "Identifica fatores individuais, sociais, educacionais e institucionais que favorecem ou dificultam a dupla carreira.", limitations: "A organização pessoal ajuda, mas não substitui suporte e políticas institucionais.", url: "https://www.scielo.br/j/rbce/a/bf6PNcmZMjP6MZLDbWTchDb/abstract/?lang=pt" },
  { id: "de-maio", title: "Perspectivas de estudantes-atletas sobre dupla carreira", institution: "Frontiers in Sports and Active Living", year: 2025, category: ["dupla carreira", "transição"], type: "Scoping review", summary: "Reúne barreiras logísticas, sociais, financeiras, curriculares e institucionais em mais de 3.000 estudantes-atletas.", limitations: "Grande parte da evidência analisada foi produzida na Europa.", url: "https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1566208/full" },
  { id: "autonomia", title: "Suporte à autonomia no esporte e no exercício", institution: "International Review of Sport and Exercise Psychology", year: 2024, category: ["autonomia", "coaching"], type: "Revisão e meta-análise", summary: "Examina como ambientes que oferecem explicações, escuta e participação se relacionam à motivação e à experiência esportiva.", limitations: "Associações médias não garantem o mesmo efeito em todas as pessoas ou contextos.", url: "https://www.tandfonline.com/doi/full/10.1080/1750984X.2022.2031252" },
  { id: "ioc", title: "Consenso do COI sobre jovens atletas de elite", institution: "British Journal of Sports Medicine", year: 2024, category: ["juventude", "proteção"], type: "Consenso", summary: "Recomenda um paradigma saudável, seguro, sustentável, holístico e centrado nos direitos do jovem atleta.", limitations: "O consenso orienta princípios e não substitui avaliação individual ou políticas locais.", url: "https://bjsm.bmj.com/content/58/17/946" },
  { id: "wada", title: "Educação antidopagem", institution: "World Anti-Doping Agency", year: 2026, category: ["antidopagem", "educação"], type: "Diretriz educacional", summary: "Oferece materiais para decisões informadas sobre substâncias, riscos, responsabilidades e integridade esportiva.", limitations: "Normas e listas são atualizadas; a fonte oficial precisa ser consultada periodicamente.", url: "https://www.wada-ama.org/en/athletes-support-personnel/anti-doping-education" }
] as const;

export const formationFaq = [
  ["O que é formação integral do atleta?", "É desenvolver capacidades esportivas junto com saúde, educação, autonomia, pensamento crítico, vínculos, proteção e projeto de vida."],
  ["Formação integral diminui a busca por resultado?", "Não. Ela procura tornar a busca por resultado mais consciente, sustentável e compatível com os direitos do jovem atleta."],
  ["Autonomia significa que o atleta decide tudo?", "Não. Autonomia é participação progressiva com explicação, limites, supervisão e responsabilidades adequadas à idade."],
  ["Qual é o papel do treinador?", "Além da orientação técnica, o treinador explica, escuta, cria limites seguros, coordena expectativas e ajuda o atleta a aprender com o processo."],
  ["O que é dupla carreira?", "É a construção simultânea das trajetórias esportiva e educacional, desde a base e não apenas perto da aposentadoria."],
  ["Educação é um plano alternativo ao esporte?", "Não. É parte da formação e amplia repertório, autonomia e possibilidades dentro e fora das pistas."],
  ["A escola é obrigada a remarcar avaliações?", "Não existe uma resposta automática para todas as instituições. O plano nacional apresenta propostas, e cada situação depende das normas e possibilidades aplicáveis."],
  ["Notas serão divulgadas ou usadas para excluir atletas?", "Não. Dados educacionais não devem virar ranking público, publicidade ou decisão automática de permanência."],
  ["A IA poderá decidir quem permanece no projeto?", "Não. Tecnologia pode apoiar organização e leitura de informações, mas decisões relevantes exigem responsabilidade e revisão humana."],
  ["Como comunicar dores ou desconfortos?", "Interrompa uma situação insegura, comunique a um adulto responsável e procure avaliação profissional apropriada quando necessário."],
  ["Como avaliar informações das redes sociais?", "Verifique autoria, evidência, conflito de interesse, data, contexto e possíveis riscos antes de transformar conteúdo em conduta."],
  ["Como conhecer o Onze Futuro?", "A página do Onze Futuro apresenta o projeto, sua proposta de acompanhamento e os caminhos de participação."]
] as const;

export const integralManifesto = [
  "Atletas que sabem ouvir, mas também sabem perguntar.",
  "Que respeitam a orientação técnica, mas não são silenciados.",
  "Que entendem que descansar também faz parte.",
  "Que reconhecem a importância de uma medalha, sem permitir que ela resuma uma vida.",
  "Que enxergam escola e esporte como partes da mesma formação.",
  "Que podem sonhar com o alto rendimento e construir outros futuros."
] as const;
