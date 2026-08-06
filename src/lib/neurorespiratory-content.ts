export const modulationMap = [
  ["Cérebro e atenção", "O ritmo respiratório participa da percepção corporal e pode influenciar temporariamente atenção e estado de alerta."],
  ["Sistema autonômico", "Frequência e profundidade alteram interações autonômicas; isso não equivale a acionar diretamente o nervo vago."],
  ["Coração e circulação", "Respiração, frequência cardíaca, pressão, barorreflexo e HRV formam um sistema acoplado."],
  ["Pulmões e vias aéreas", "A ventilação cresce com a intensidade. Falta de ar incomum pode exigir investigação clínica."],
  ["Músculos respiratórios", "Diafragma e outros músculos inspiratórios trabalham e podem ser treinados com resistência específica."],
  ["Percepção de esforço", "O padrão respiratório ajuda a reconhecer intensidade, tensão e sintomas — sem substituir medidas ou profissionais."]
] as const;

export const breathingPractices = [
  ["Respiração lenta ou ritmada", "Modificar voluntariamente frequência e regularidade em repouso.", "Educação e autorregulação"],
  ["Biofeedback cardiorrespiratório", "Visualizar a relação entre respiração, pulso e HRV em contexto padronizado.", "Aprendizagem experimental"],
  ["Treinamento muscular inspiratório", "Usar resistência externa mensurável para treinar músculos inspiratórios.", "Treinamento supervisionado"],
  ["Educação durante a corrida", "Observar fala, ritmo, tensão e mudanças naturais da ventilação.", "Consciência de esforço"],
  ["Intervenção clínica", "Avaliar e tratar asma, EILO ou outras condições respiratórias.", "Somente profissionais habilitados"]
] as const;

export const evidenceMatrix = [
  { strategy: "Respiração lenta e ritmada", science: "Modifica agudamente HRV e acoplamento cardiorrespiratório.", performance: "Baixa e indireta", children: "Inicial", verdict: "Educação e autorregulação" },
  { strategy: "Biofeedback de HRV", science: "Ajuda a visualizar a interação entre respiração e resposta cardíaca.", performance: "Promissora e heterogênea", children: "Muito limitada", verdict: "Experimental e não classificatório" },
  { strategy: "Treinamento inspiratório", science: "Melhora sobretudo força e resistência dos músculos respiratórios.", performance: "Baixa a moderada", children: "Muito inicial", verdict: "Avaliação e supervisão profissional" },
  { strategy: "Respiração nasal exclusiva", science: "Pode apoiar percepção em alguns contextos, sem superioridade universal.", performance: "Inconclusiva", children: "Insuficiente", verdict: "Não impor" },
  { strategy: "Passadas e respiração", science: "Pode desenvolver percepção rítmica e consciência do esforço.", performance: "Direta limitada", children: "Insuficiente", verdict: "Ferramenta educativa" },
  { strategy: "Hiperventilação e apneias", science: "Sem base para aplicação rotineira em crianças atletas.", performance: "Incerta", children: "Inadequada", verdict: "Fora do projeto" },
  { strategy: "Estimulação elétrica vagal", science: "Campo médico e experimental.", performance: "Não estabelecida", children: "Ausente", verdict: "Fora do escopo 11RUN" }
] as const;

export const myths = [
  ["“Respirar fundo coloca mais oxigênio no corpo.”", "Em pessoas saudáveis, a saturação já costuma estar alta. Respirar excessivamente pode reduzir CO₂ e causar tontura."],
  ["“Expirar por mais tempo sempre ativa o vago.”", "O sistema autonômico não funciona como um botão. Respostas dependem do padrão, contexto e indivíduo."],
  ["“Quanto maior a HRV, melhor.”", "HRV só ganha sentido com protocolo, histórico individual, respiração, horário, posição e equipamento."],
  ["“Respirar pelo nariz melhora automaticamente o VO₂ máximo.”", "A evidência não demonstra superioridade universal, especialmente em intensidades elevadas."],
  ["“Músculos inspiratórios fortes garantem corrida rápida.”", "Força respiratória é uma dimensão; desempenho depende de treinamento, crescimento, economia, saúde e contexto."],
  ["“Respiração substitui psicólogo, médico ou fisioterapeuta.”", "Exercícios educativos não diagnosticam nem tratam condições clínicas."]
] as const;

export const warningSigns = ["dor ou aperto no peito", "tontura, confusão ou desmaio", "chiado recorrente", "falta de ar desproporcional", "ruído ou sensação de garganta fechando", "lábios arroxeados", "sintomas que não melhoram após interrupção", "medo intenso associado à respiração"] as const;

export const programLayers = [
  { level: "Camada 1", title: "Respirar para perceber", scope: "Educativa para todos", description: "Anatomia básica, relação com intensidade, postura, tensão, comunicação de sintomas e mitos. Sem carga ou equipamento." },
  { level: "Camada 2", title: "Respirar para regular", scope: "Opcional e supervisionada", description: "Práticas curtas em repouso, preparação, retorno após esforço, atenção e biofeedback educativo. Nunca como punição." },
  { level: "Camada 3", title: "Respirar para sustentar", scope: "Técnica e seletiva", description: "Avaliação inspiratória, treinamento com resistência e reavaliação, somente com indicação, aptidão e profissional habilitado." }
] as const;

export const ageJourney = [
  ["10 anos", "Descobrir", "Onde sinto a respiração? Como conto ao treinador que algo não está bem?"],
  ["11 anos", "Reconhecer", "Como a intensidade muda minha fala? Estou tensionando o corpo?"],
  ["12 anos", "Compreender", "Como respiração, coração e esforço se relacionam? Por que métricas variam?"],
  ["13 anos", "Participar", "Como registrar percepções, discutir estratégias e interpretar tendências sem julgamento?"]
] as const;

export const respiratoryReferences = [
  { title: "The physiological effects of slow breathing", authors: "Russo, Santarelli e O’Rourke", year: 2017, axis: "Fisiologia", type: "Revisão", summary: "Revisa efeitos respiratórios, cardiovasculares e autonômicos da respiração lenta.", limitation: "Mecanismos agudos não equivalem automaticamente a desempenho esportivo.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5709795/" },
  { title: "Effects of voluntary slow breathing on heart rate and HRV", authors: "Laborde e colaboradores", year: 2022, axis: "Fisiologia", type: "Meta-análise", summary: "Sintetiza alterações de frequência cardíaca e HRV durante respiração voluntária lenta.", limitation: "HRV é fortemente influenciada pelo próprio padrão respiratório da medição.", url: "https://pubmed.ncbi.nlm.nih.gov/35623448/" },
  { title: "Nasal respiration entrains human limbic oscillations", authors: "Zelano e colaboradores", year: 2016, axis: "Neurociência", type: "Estudo experimental", summary: "Explora sincronização de oscilações límbicas e tarefas cognitivas em adultos.", limitation: "Não demonstra ganho de performance nem permite extrapolação direta para crianças.", url: "https://pubmed.ncbi.nlm.nih.gov/27927961/" },
  { title: "Resonance frequency breathing in adolescents", authors: "Michels e colaboradores", year: 2026, axis: "Adolescentes", type: "Ensaio randomizado", summary: "Avaliou resposta aguda ao estresse em 150 adolescentes belgas.", limitation: "Não houve diferença em emoção percebida, regulação emocional ou recuperação.", url: "https://pubmed.ncbi.nlm.nih.gov/41257401/" },
  { title: "HRV biofeedback in athletes", authors: "Pagaduan e colaboradores", year: 2020, axis: "Biofeedback", type: "Revisão", summary: "Mapeia aplicações de biofeedback de HRV em diferentes modalidades.", limitation: "Protocolos e desfechos heterogêneos limitam promessas individuais.", url: "https://pubmed.ncbi.nlm.nih.gov/32774542/" },
  { title: "Respiratory muscle training in healthy individuals", authors: "Illi e colaboradores", year: 2012, axis: "Treinamento inspiratório", type: "Meta-análise", summary: "Sintetiza 46 estudos e observa respostas maiores em pessoas menos condicionadas.", limitation: "Benefícios variam conforme população, protocolo e teste.", url: "https://pubmed.ncbi.nlm.nih.gov/22765281/" },
  { title: "Inspiratory muscle training in physically active children", authors: "Elshafey e colaboradores", year: 2022, axis: "Crianças", type: "Ensaio", summary: "Encontrou melhora inspiratória e de medidas físicas após seis semanas.", limitation: "Amostra de somente 30 crianças e protocolo intensivo; requer reprodução.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9690705/" },
  { title: "Breathing route during endurance exercise", authors: "Bergqvist e colaboradores", year: 2025, axis: "Endurance", type: "Estudo cruzado", summary: "Comparou respiração oral e oronasal em 12 atletas homens treinados.", limitation: "Amostra pequena e masculina; não mostrou superioridade universal nasal.", url: "https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1654725/full" },
  { title: "Exercise-induced bronchoconstriction guideline", authors: "American Thoracic Society", year: 2013, axis: "Saúde respiratória", type: "Diretriz clínica", summary: "Orienta avaliação e manejo da broncoconstrição induzida pelo exercício.", limitation: "É referência clínica e exige interpretação profissional.", url: "https://pubmed.ncbi.nlm.nih.gov/23634861/" },
  { title: "Exercise-induced laryngeal obstruction in athletes", authors: "Subgrupo do consenso do COI", year: 2022, axis: "Saúde respiratória", type: "Revisão", summary: "Discute obstrução laríngea induzida pelo exercício e seus diagnósticos diferenciais.", limitation: "Sensação de garganta fechando não deve ser atribuída automaticamente à ansiedade.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9120388/" }
] as const;

export const respiratoryFaq = [
  ["Respiração lenta melhora a corrida?", "Pode modificar estado fisiológico e percepção, mas não há evidência suficiente de que isoladamente melhore o tempo."],
  ["Respirar pelo nariz é melhor?", "Pode ser confortável em repouso e esforços leves. Em intensidades altas, a respiração oronasal é normal e não há superioridade universal."],
  ["A respiração pode diminuir a frequência cardíaca?", "Pode alterar agudamente frequência e oscilações em repouso; na corrida, a demanda do exercício e vários fatores predominam."],
  ["Crianças podem fazer respiração ritmada?", "Atividades simples, curtas e supervisionadas podem ser educativas. Protocolos adultos não devem ser copiados."],
  ["O que é frequência de ressonância?", "É uma frequência em que oscilações respiratórias e cardiovasculares apresentam maior sincronização para uma pessoa e condição."],
  ["HRV elevada significa recuperação?", "Não isoladamente. Ela depende de contexto, protocolo, respiração, posição, horário, idade, equipamento e histórico."],
  ["Treinamento inspiratório é respirar profundamente?", "Não. Ele usa resistência externa mensurável para treinar músculos inspiratórios."],
  ["Todo corredor precisa de treinamento inspiratório?", "Não. A utilidade depende de avaliação, perfil, objetivo e supervisão."],
  ["Máscara de treino simula altitude?", "Não automaticamente, e não deve ser usada em crianças como atalho de performance."],
  ["A respiração pode tratar asma?", "Não. Asma e broncoconstrição exigem diagnóstico e tratamento profissional."],
  ["Garganta fechando é ansiedade?", "Não necessariamente. EILO e outras condições precisam ser investigadas."],
  ["O atleta deve controlar a respiração durante toda a corrida?", "Não. A ventilação precisa responder automaticamente à demanda; consciência é ferramenta, não obrigação."]
] as const;
