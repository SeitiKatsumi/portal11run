export type OnzeFuturoFaqItem = {
  id: string;
  question: string;
  answer: string[];
};

export type OnzeFuturoFaqGroup = {
  id: string;
  label: string;
  title: string;
  description: string;
  items: OnzeFuturoFaqItem[];
};

export const onzeFuturoFaqGroups: OnzeFuturoFaqGroup[] = [
  {
    id: "projeto",
    label: "Projeto",
    title: "Propósito, público e ciclo",
    description: "O que é o Onze Futuro, para quem foi criado e como funciona o piloto de 2026 a 2029.",
    items: [
      {
        id: "o-que-e",
        question: "O que é o Onze Futuro?",
        answer: [
          "O Onze Futuro é a frente de formação de base da 11RUN para jovens corredores. O projeto aproxima atleta, família, treinador, escola e profissionais de apoio em um processo que combina cultura de movimento, desenvolvimento esportivo, rotina escolar, saúde emocional, experiências competitivas e acompanhamento de longo prazo.",
          "Não é uma promessa de alto rendimento, bolsa, patrocínio ou carreira profissional. É um ambiente de formação e oportunidade, construído com respeito à idade, à maturação e à individualidade de cada criança."
        ]
      },
      {
        id: "publico",
        question: "Quem pode ser cadastrado?",
        answer: [
          "O público principal desta fase são atletas de 10 a 13 anos interessados em corrida, especialmente provas de meio-fundo e fundo. O cadastro pode ser iniciado por pai, mãe, responsável legal, treinador, escola, projeto social ou outro profissional envolvido, mas a participação de menor de idade depende da ciência e da autorização do responsável legal.",
          "Estar na faixa etária e preencher o formulário não gera aceite automático. A equipe considera o contexto completo do atleta, a estrutura de acompanhamento disponível, a compatibilidade com a proposta e a capacidade operacional do projeto."
        ]
      },
      {
        id: "ciclo",
        question: "O projeto vai de 2026 a 2029?",
        answer: [
          "Sim. 2026 a 2029 é o ciclo institucional previsto para o piloto, com uma primeira amostragem de cinco atletas. Nesse período, a 11RUN pretende estudar, validar e aprimorar a metodologia, o acompanhamento e a viabilidade de expansão.",
          "Esse calendário não significa permanência individual garantida até 2029. A continuidade de cada atleta é acompanhada periodicamente e depende do melhor interesse da criança, da disponibilidade do projeto e do alinhamento entre atleta, família, treinador, equipe 11RUN e demais profissionais."
        ]
      },
      {
        id: "cinco-atletas",
        question: "Por que a primeira turma tem apenas cinco atletas?",
        answer: [
          "A turma reduzida permite acompanhamento próximo, validação responsável dos processos e aprendizado real antes de qualquer expansão. A proposta é observar evolução esportiva, adaptação competitiva, rotina, escola, maturidade emocional, apoio familiar, materiais, benefícios e comunicação sem perder qualidade ou proteção.",
          "O número inicial é uma amostragem do piloto, não o limite permanente do projeto."
        ]
      },
      {
        id: "promessa",
        question: "A participação garante resultados, patrocínio, bolsa ou vaga em competições?",
        answer: [
          "Não. O projeto oferece acompanhamento e pode criar oportunidades, mas não garante desempenho, pódio, convocação, patrocínio, bolsa, ajuda financeira, material, inscrição ou permanência. Cada benefício depende de critérios internos, disponibilidade, calendário, parceiros e aprovação específica.",
          "Resultados esportivos são tratados como parte do desenvolvimento, nunca como valor pessoal da criança."
        ]
      }
    ]
  },
  {
    id: "cadastro",
    label: "Cadastro",
    title: "Formulário, documentos e avaliação",
    description: "O que é solicitado no cadastro, por que esses dados são necessários e o que acontece depois do envio.",
    items: [
      {
        id: "quem-preenche",
        question: "Quem deve preencher o formulário?",
        answer: [
          "O formulário pode ser iniciado por uma pessoa que conheça a trajetória do atleta, como responsável legal, treinador, escola ou projeto. Para menores de idade, os dados do responsável e o aceite do termo são obrigatórios. O responsável deve revisar as informações antes do envio e manter os contatos atualizados."
        ]
      },
      {
        id: "dados-solicitados",
        question: "Quais informações são solicitadas?",
        answer: [
          "O cadastro reúne dados do solicitante, do atleta e do responsável legal; documentos de identificação; endereço; escola; medidas e numeração de calçado; histórico esportivo; melhores marcas; competições; treinador e CREF; contatos; chave PIX do responsável; sonho do atleta; mensagem de contexto; e identificação de quem aceita o termo.",
          "A equipe deve usar apenas os dados necessários para analisar o cadastro, organizar o acompanhamento, cumprir obrigações, comunicar decisões e administrar benefícios. Informações incompletas ou incorretas podem atrasar ou impedir a avaliação."
        ]
      },
      {
        id: "cinco-fotos",
        question: "Por que são solicitadas exatamente cinco fotos?",
        answer: [
          "As cinco imagens ajudam na identificação do atleta, na composição do perfil interno, na análise do material enviado e, quando houver autorização válida, na comunicação institucional do projeto. Elas não devem conter documentos, endereço, uniforme escolar com dados sensíveis ou outras crianças sem autorização.",
          "A publicação de imagem deve respeitar o termo aceito, a Política de Privacidade e pedidos posteriores de revisão ou retirada quando aplicáveis."
        ]
      },
      {
        id: "treinador-cref",
        question: "É necessário ter treinador com CREF ativo?",
        answer: [
          "A participação prevê um treinador habilitado e com CREF ativo para conduzir o treinamento cotidiano. A 11RUN acompanha, orienta e pode indicar referências ou profissionais, mas não substitui o responsável técnico que está próximo do atleta nem assume a execução diária dos treinos.",
          "Mudança de treinador deve ser comunicada, pois pode alterar o plano, a segurança e a continuidade do acompanhamento."
        ]
      },
      {
        id: "avaliacao",
        question: "Como acontece a seleção?",
        answer: [
          "A equipe analisa o conjunto: idade, interesse, contexto familiar e escolar, histórico esportivo, estrutura técnica, disponibilidade para acompanhamento, objetivos, maturidade, segurança e aderência à proposta. Uma marca isolada não decide o processo.",
          "A 11RUN pode solicitar conversa, confirmação de documentos ou informações complementares antes de aceitar, manter em análise ou recusar o cadastro."
        ]
      },
      {
        id: "atualizacao-dados",
        question: "Posso corrigir ou atualizar o cadastro depois?",
        answer: [
          "Sim. O painel permite consultar e atualizar parte das informações. Alterações sensíveis, documentos, responsável legal, treinador, condição de saúde, escola, endereço ou dados financeiros devem ser comunicados e podem exigir conferência humana."
        ]
      }
    ]
  },
  {
    id: "rede",
    label: "Rede de cuidado",
    title: "Papéis e responsabilidades",
    description: "Como atleta, família, treinador, escola e profissionais colaboram sem confundir responsabilidades.",
    items: [
      {
        id: "papel-atleta",
        question: "Qual é o papel do atleta?",
        answer: [
          "Participar com honestidade, comunicar desconfortos e dificuldades, respeitar sua etapa de desenvolvimento, cuidar da rotina escolar, manter diálogo com família e treinador e usar o painel com informações verdadeiras. A criança pode fazer perguntas, expressar limites e dizer quando algo não está bem.",
          "O projeto não deve transformar medalhas, notas ou presença em pressão excessiva."
        ]
      },
      {
        id: "papel-familia",
        question: "Qual é o papel dos pais ou responsáveis?",
        answer: [
          "Autorizar a participação, acompanhar comunicações, manter documentos e dados corretos, observar saúde e bem-estar, organizar deslocamentos, validar envios sensíveis, conversar com o treinador e evitar cobrança desproporcional. Também cabe à família informar mudanças de saúde, escola, rotina, cidade, treinador ou situação familiar que possam afetar o atleta.",
          "A responsabilidade cotidiana pelo menor, inclusive antes, durante e depois de treinos, deslocamentos, testes e competições, permanece com os responsáveis legais e com os profissionais diretamente encarregados da atividade. Essa divisão não afasta deveres legais próprios da 11RUN, de organizadores ou de prestadores por atos e omissões dentro de suas respectivas atribuições."
        ]
      },
      {
        id: "papel-treinador",
        question: "Qual é o papel do treinador?",
        answer: [
          "Planejar e conduzir treinos adequados à idade, observar carga, recuperação e sinais de risco, registrar informações verdadeiras, dialogar com a família e articular-se com a equipe quando necessário. O treinador não deve acelerar etapas nem usar o painel para impor volume ou intensidade inadequados."
        ]
      },
      {
        id: "papel-escola",
        question: "Como escola, professores e projetos sociais podem colaborar?",
        answer: [
          "Podem contextualizar rotina, frequência, adaptação e desenvolvimento, sempre respeitando autorização, necessidade e privacidade. O objetivo não é vigiar a vida escolar, mas compreender se esporte e educação estão convivendo de forma saudável.",
          "Boletins e documentos escolares ficam em área protegida e não devem ser expostos publicamente."
        ]
      },
      {
        id: "profissionais",
        question: "Como médicos, psicólogos, fisioterapeutas, nutricionistas e outros profissionais participam?",
        answer: [
          "Cada profissional atua dentro de sua habilitação, autonomia, sigilo e relação direta com a família. A equipe multidisciplinar pode trocar apenas as informações necessárias, com base adequada e proteção reforçada para dados de menores e de saúde.",
          "O painel não substitui avaliação clínica, diagnóstico, prescrição, atendimento psicológico, fisioterapêutico ou nutricional."
        ]
      },
      {
        id: "saude-seguranca",
        question: "Como funcionam saúde, atestado e segurança?",
        answer: [
          "O responsável deve informar condições relevantes e manter os documentos de aptidão solicitados pelo projeto válidos e atualizados. Treinos e competições precisam ser orientados por profissionais habilitados e interrompidos diante de dor, mal-estar, lesão, sofrimento emocional ou qualquer sinal de risco.",
          "Um documento no painel não elimina a responsabilidade de observar o estado real do atleta nem substitui nova avaliação quando houver mudança de saúde."
        ]
      }
    ]
  },
  {
    id: "painel",
    label: "Painel do atleta",
    title: "Tudo o que aparece no painel",
    description: "Identidade, marcas, agenda, benefícios, documentos, direitos, notificações e modo de consulta.",
    items: [
      {
        id: "acesso-painel",
        question: "Para que serve o painel do atleta?",
        answer: [
          "O painel centraliza a trajetória do participante: perfil, melhor marca de 1.000 m, benefícios já recebidos, próxima prova ou desafio, próximo teste, módulos gamificados, histórico de marcas, agenda, documentos, dados cadastrais, direitos do projeto e notificações.",
          "Ele organiza o acompanhamento, mas não substitui conversas entre atleta, família, treinador e equipe."
        ]
      },
      {
        id: "quem-acessa",
        question: "Quem pode acessar o painel?",
        answer: [
          "O acesso normal é feito pela conta vinculada ao atleta e sua família. A equipe administrativa pode abrir uma prévia em modo somente leitura para prestar suporte e conferir o que o participante visualiza. Credenciais não devem ser compartilhadas com pessoas sem autorização.",
          "Treinadores e outros profissionais só devem receber informações compatíveis com sua função e com a autorização aplicável."
        ]
      },
      {
        id: "marcas-testes",
        question: "Como funcionam as marcas e os testes de 1.000 m?",
        answer: [
          "A área registra data, local, fonte e tempo, destaca a melhor marca e mostra a evolução individual. O planejamento prevê testes periódicos, exibidos na agenda conforme disponibilidade e orientação técnica.",
          "O histórico não deve ser usado para comparar crianças de maneira humilhante ou para concluir, sozinho, quem merece permanecer."
        ]
      },
      {
        id: "eventos",
        question: "O que aparece na agenda de eventos?",
        answer: [
          "A agenda separa próximos eventos e atividades finalizadas, com data, horário, local e orientações disponíveis. Uma atividade aparecer no painel não dispensa confirmação de inscrição, regras específicas, autorização familiar, logística ou avaliação de segurança."
        ]
      },
      {
        id: "financeiro",
        question: "Qual é a diferença entre benefícios planejados e executados?",
        answer: [
          "Planejados são lançamentos previstos, pendentes ou ainda sujeitos a confirmação. Executados são valores, materiais, inscrições ou outros benefícios registrados como pagos ou entregues. O painel também apresenta o total já recebido.",
          "Uma projeção não é promessa de pagamento. Valores, datas, materiais e periodicidade podem variar conforme aprovação, disponibilidade financeira, patrocinadores, fornecedores e regras do projeto."
        ]
      },
      {
        id: "direitos-documentos",
        question: "O que são 'Informações do cadastro' e 'Direitos do projeto'?",
        answer: [
          "Informações do cadastro reúne os dados enviados e os documentos vinculados, com opção de atualização quando habilitada. Direitos do projeto mostra, item a item, se existe direito vigente a uniforme, material, inscrição, ajuda ou outro benefício cadastrado.",
          "A indicação 'tem direito' depende do registro administrativo e não autoriza troca, venda ou transferência sem concordância da 11RUN."
        ]
      }
    ]
  },
  {
    id: "gamificacao",
    label: "Desafios",
    title: "Módulos gamificados, passo a passo",
    description: "Como funcionam score, escola, assiduidade, evolução, ideias, conquistas e benefícios projetados.",
    items: [
      {
        id: "gamificacao-proposito",
        question: "Qual é o objetivo dos Desafios 11RUN?",
        answer: [
          "Os desafios tornam visíveis hábitos importantes da formação: compromisso escolar, constância, evolução pessoal e participação na melhoria do projeto. Eles usam progresso, status, pontos e conquistas para dar feedback positivo, não para rotular talento ou criar competição prejudicial entre crianças.",
          "Toda entrega pode passar por análise humana, correção, aprovação ou rejeição fundamentada."
        ]
      },
      {
        id: "score",
        question: "O que é o Score 11RUN?",
        answer: [
          "É um indicador de participação e compromisso calculado a partir de ações válidas, como envios, aprovações, testes, evolução pessoal, ideias e conquistas. O painel mostra o nível atual, o próximo nível e quantos pontos faltam.",
          "O score não é ranking de talento, não mede valor humano, não substitui avaliação técnica e nunca reduz a ajuda de custo atual. Critérios e pesos podem ser ajustados com transparência para preservar a finalidade educativa."
        ]
      },
      {
        id: "desafio-escolar",
        question: "Como funciona o Desafio Escolar?",
        answer: [
          "O responsável envia o boletim ou histórico do trimestre, escolhe período e ano e autoriza a análise privada. A leitura assistida por tecnologia pode organizar médias e informações, mas qualquer reconhecimento ou benefício depende de revisão e aprovação humana.",
          "O documento escolar é privado. Uma nota isolada não define o atleta; dificuldades devem ser tratadas com contexto, apoio e respeito. Se a leitura automática estiver incerta, a equipe faz conferência manual ou solicita correção."
        ]
      },
      {
        id: "desafio-assiduidade",
        question: "Como funciona o Desafio de Assiduidade?",
        answer: [
          "O atleta ou responsável envia a planilha do último mês, informa a assiduidade em intervalos de 10%, pode acrescentar uma observação e confirma que os dados são verdadeiros. A equipe valida o documento e registra meses aprovados, sequência atual e melhor assiduidade.",
          "Assiduidade não significa treinar doente, lesionado ou sem descanso. Faltas justificadas e contextos familiares, escolares ou de saúde devem ser informados e avaliados de forma humana."
        ]
      },
      {
        id: "minha-evolucao",
        question: "Como funciona o módulo Minha Evolução?",
        answer: [
          "Ele apresenta os testes válidos de 1.000 m em linha do tempo, melhor marca, evolução desde o primeiro registro, variação entre os últimos testes e tendência. O foco é comparar o atleta com sua própria trajetória, respeitando fase de crescimento, local, pista, clima, carga de treino e condições do dia.",
          "Uma piora pontual não é fracasso nem motivo automático de desligamento."
        ]
      },
      {
        id: "ideias",
        question: "Como funciona Ideias para o Projeto?",
        answer: [
          "O atleta pode enviar título, categoria, descrição, problema observado, melhoria esperada e imagem opcional. A equipe classifica a ideia como enviada, em análise, aprovada, em planejamento, em desenvolvimento, implementada, rejeitada ou duplicada e pode responder pelo painel.",
          "Somente ideias validadas entram no desafio público, com nome abreviado para reduzir exposição. O limite de envios e o ciclo do ranking podem ser configurados pela equipe. Ideias implementadas recebem reconhecimento específico."
        ]
      },
      {
        id: "conquistas",
        question: "Quais conquistas e badges podem aparecer?",
        answer: [
          "Há conquistas ligadas ao primeiro boletim, médias escolares, primeira planilha, constância, mês completo, sequências de meses, primeiro teste, primeira evolução, evolução percentual, recorde pessoal, quantidade de testes, primeira ideia, ideias validadas e ideia implementada.",
          "Badges celebram etapas verificadas e não criam direito automático a dinheiro, patrocínio, permanência ou tratamento preferencial."
        ]
      },
      {
        id: "beneficio-projetado",
        question: "Como funciona o Benefício Projetado?",
        answer: [
          "O painel pode somar percentuais aprovados dos desafios Escolar e Assiduidade ao valor de ajuda atual e exibir um novo valor projetado, respeitando o limite configurado. A projeção é informativa e nunca é aplicada automaticamente.",
          "A equipe administrativa faz a decisão final, define vigência e registra a aprovação. Disponibilidade financeira, regras internas, documentação, patrocinadores e revisão do caso continuam valendo."
        ]
      },
      {
        id: "status-notificacoes",
        question: "O que significam os status e as notificações?",
        answer: [
          "Uma entrega pode aparecer como não iniciada, em andamento, enviada, em análise, aguardando correção, aprovada, concluída ou rejeitada. Notificações informam novas conquistas, análise de documentos, pedidos de correção, aprovação ou revisão de benefícios e atualização de ideias.",
          "Quando houver dúvida ou discordância, família e atleta podem pedir esclarecimento e revisão humana."
        ]
      }
    ]
  },
  {
    id: "permanencia",
    label: "Permanência",
    title: "Continuidade, pausas e desligamento",
    description: "Uma regra bilateral, humana e transparente para proteger a criança e o projeto.",
    items: [
      {
        id: "desvinculamento",
        question: "Atleta ou 11RUN podem encerrar a participação antes de 2029?",
        answer: [
          "Sim. O ciclo institucional é 2026–2029, mas tanto a família ou o responsável quanto a 11RUN podem solicitar a desvinculação a qualquer tempo. A permanência não é automática nem irrevogável.",
          "Sempre que possível, a decisão deve ser comunicada de forma clara, privada e respeitosa, com registro do encerramento e orientação sobre acessos, benefícios, materiais, imagem e dados."
        ]
      },
      {
        id: "motivos",
        question: "Quais situações podem levar a uma pausa ou ao desligamento?",
        answer: [
          "Podem ser considerados contratempos; mudança de saúde, cidade, escola, treinador ou rotina; questões familiares de qualquer natureza; sobrecarga; indisponibilidade; problemas de segurança; dificuldades operacionais ou financeiras; descumprimento grave de regras; e desalinhamento de objetivos, sonhos, expectativas, comportamento, comunicação ou modelo de acompanhamento.",
          "O contexto de desempenho também pode ser revisto, mas nunca por um resultado isolado. Idade, maturação, saúde, ambiente, oportunidades e trajetória devem ser analisados em conjunto, sempre priorizando o melhor interesse da criança."
        ]
      },
      {
        id: "familia-pede-saida",
        question: "Como a família solicita pausa ou saída?",
        answer: [
          "O responsável deve comunicar a equipe por um canal oficial, indicar se deseja pausa ou encerramento e informar o que precisa ser preservado por segurança e privacidade. A criança deve ser ouvida de forma compatível com sua idade e maturidade.",
          "A saída não deve gerar exposição, humilhação ou retaliação. Obrigações já existentes, guarda legal de registros e devolução de itens eventualmente cedidos são analisadas caso a caso."
        ]
      },
      {
        id: "projeto-encerra",
        question: "Como acontece um desligamento iniciado pela 11RUN?",
        answer: [
          "A equipe deve avaliar fatos e contexto, evitar decisões exclusivamente automatizadas e, quando a urgência de segurança não exigir afastamento imediato, conversar com o responsável e permitir esclarecimentos. Medidas podem incluir orientação, plano de ajuste, pausa, restrição de atividade ou encerramento.",
          "A comunicação deve preservar dignidade, privacidade, estudo, saúde, vínculos familiares e imagem do atleta."
        ]
      },
      {
        id: "efeitos-saida",
        question: "O que acontece com painel, benefícios e dados após a saída?",
        answer: [
          "Benefícios futuros, representações e acessos vinculados à participação podem ser encerrados na data informada. Registros já executados permanecem no histórico administrativo pelo período necessário para prestação de contas, segurança, exercício de direitos e obrigações legais.",
          "O responsável pode exercer os direitos previstos na Política de Privacidade, inclusive pedir acesso, correção, revisão, revogação de consentimento e eliminação quando aplicável."
        ]
      }
    ]
  },
  {
    id: "privacidade",
    label: "Privacidade",
    title: "Dados, imagem, tecnologia e direitos",
    description: "Proteção reforçada para crianças e adolescentes, com transparência e revisão humana.",
    items: [
      {
        id: "melhor-interesse",
        question: "Como os dados de crianças e adolescentes são protegidos?",
        answer: [
          "O tratamento deve observar o melhor interesse da criança ou do adolescente, usar linguagem clara, limitar a coleta ao necessário e aplicar proteção reforçada. O responsável legal participa das autorizações e pode exercer direitos em nome do menor.",
          "A Política de Privacidade detalha finalidades, dados coletados, compartilhamentos, segurança, retenção e canais de atendimento."
        ]
      },
      {
        id: "publico-privado",
        question: "Quais informações podem ser públicas e quais ficam privadas?",
        answer: [
          "Quando necessário e autorizado, perfil público e rankings podem mostrar nome esportivo, categoria ou idade, gênero esportivo, tempo, data, local e modalidade. Foto, biografia ou nome civil completo exigem análise e autorização compatível.",
          "CPF, RG, telefone, e-mail, endereço, escola, contato do responsável, dados de saúde, data completa de nascimento, credenciais, dados financeiros, documentos escolares e arquivos internos não devem aparecer publicamente."
        ]
      },
      {
        id: "imagem",
        question: "Como funciona o uso de imagem?",
        answer: [
          "Imagens autorizadas podem apoiar perfil, análise, divulgação institucional e comunicação do projeto. A autorização deve indicar finalidade e não permite uso incompatível, constrangedor ou que exponha dados desnecessários.",
          "Pedidos de correção, substituição, interrupção de exposição ou retirada serão avaliados conforme a Política de Privacidade e as obrigações aplicáveis."
        ]
      },
      {
        id: "ia",
        question: "A inteligência artificial decide notas, benefícios ou permanência?",
        answer: [
          "Não. A tecnologia pode auxiliar leitura e organização de documentos, sinalizar confiança ou produzir uma sugestão. Aprovação de boletim, assiduidade, benefício, permanência e medidas relevantes dependem de análise humana.",
          "Atleta e responsável podem pedir explicação e revisão de decisões que afetem seus interesses."
        ]
      },
      {
        id: "compartilhamento",
        question: "Com quem os dados podem ser compartilhados?",
        answer: [
          "Somente com equipe autorizada e prestadores necessários à operação, como infraestrutura, armazenamento, comunicação, análise documental e suporte profissional, dentro de finalidade definida e deveres de segurança. Patrocinadores e parceiros não recebem acesso irrestrito ao cadastro.",
          "A 11RUN declara que não vende dados pessoais."
        ]
      },
      {
        id: "direitos-lgpd",
        question: "Quais direitos atleta e responsável podem exercer?",
        answer: [
          "Podem pedir confirmação do tratamento, acesso, correção, informação sobre compartilhamentos, revisão de decisão automatizada, anonimização, bloqueio, eliminação quando aplicável e revogação de consentimento. Alguns registros podem ser mantidos quando houver obrigação legal, segurança ou exercício regular de direitos.",
          "As solicitações devem seguir o canal indicado na Política de Privacidade."
        ]
      },
      {
        id: "documentos-prevalecem",
        question: "Esta FAQ substitui os termos e políticas?",
        answer: [
          "Não. A FAQ traduz o funcionamento em linguagem acessível. Em caso de dúvida específica, prevalecem o termo efetivamente aceito, a Política de Privacidade, os Termos de Uso, as Diretrizes aos Atletas, regulamentos de eventos e a legislação aplicável.",
          "Mudanças relevantes devem ser informadas com transparência e podem exigir novo aceite."
        ]
      }
    ]
  }
];

export const onzeFuturoFaqItems = onzeFuturoFaqGroups.flatMap((group) => group.items);
