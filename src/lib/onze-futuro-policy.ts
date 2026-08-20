export const ONZE_FUTURO_TERM_VERSION = "2.0-2026-08-20";

export const onzeFuturoTerm = {
  title: "Termo de aceite do Onze Futuro",
  version: ONZE_FUTURO_TERM_VERSION,
  legalNotice:
    "Minuta institucional elaborada com base nas normas aplicáveis e sujeita à validação jurídica especializada.",
  clauses: [
    "O Onze Futuro é um projeto privado, voluntário e complementar de formação esportiva de base, acompanhamento institucional e criação de oportunidades. Seu objetivo é ajudar e complementar o ecossistema esportivo que o atleta já possui, sem substituir família, treinador, escola, clube, equipe, profissionais de saúde ou demais responsáveis por sua formação.",
    "A 11RUN não dirige a carreira nem a rotina técnica do atleta. A participação não cria vínculo empregatício, profissional, societário, associativo, previdenciário, de representação, agenciamento ou exclusividade. Não há salário, prestação de serviços, jornada, controle de ponto, subordinação, horário obrigatório, meta ou cobrança de resultado.",
    "Materiais, uniformes, inscrições, ajuda de custo e outros benefícios eventualmente concedidos não constituem salário ou remuneração, não são permanentes, dependem de disponibilidade e critérios internos e podem ser alterados ou encerrados.",
    "O painel e o teste de 1.000 m são recursos de registro e acompanhamento do próprio atleta, de sua família e de seu treinador. Não prescrevem treinos, não controlam produtividade e não determinam talento, permanência ou resultado.",
    "A condução técnica cotidiana permanece com profissional legalmente habilitado, livremente escolhido e verificado pela família. A família responde pela organização e supervisão dos treinos externos, deslocamentos, descanso, hidratação, saúde, segurança e atividades realizadas antes, durante ou depois da prática.",
    "A divisão de responsabilidades não afasta os deveres legais próprios da 11RUN, dos organizadores de eventos ou dos prestadores por seus atos e omissões dentro das respectivas atribuições.",
    "Quando houver marcação, logo, uniforme, menção ao projeto ou aparência de representação institucional, a marca 11RUN somente poderá ser associada a conteúdo esportivo verdadeiro, seguro e compatível com estas políticas. É proibida sua associação a exposição ou constrangimento de crianças, preconceito, assédio, violência, discurso de ódio, ilegalidade, manifestação político-partidária, religiosa ou ideológica, ou a terceiros, equipes e marcas de modo que sugira parceria inexistente.",
    "Patrocinadores, apoiadores e parceiros somente podem ser marcados, mencionados institucionalmente ou ter seus logos utilizados mediante autorização prévia e escrita da 11RUN. Conversas e ações paralelas não autorizadas não representam o projeto.",
    "É proibido ao atleta, a seus familiares ou representantes usar a participação no projeto para solicitar dinheiro, produtos, serviços, patrocínios, doações, empréstimos, favores, inscrições, transporte, hospedagem ou ajuda de qualquer natureza a diretores, gestores ou integrantes da 11RUN e seus familiares; patrocinadores e seus colaboradores; apoiadores, voluntários, parceiros, fornecedores, famílias de outros atletas, participantes de eventos ou pessoas e organizações conhecidas por meio do projeto.",
    "A proibição alcança pedidos pessoais, por telefone, WhatsApp, redes sociais, e-mail, mensagens privadas, intermediários, rifas, campanhas, arrecadações e vaquinhas que mencionem a relação com a 11RUN. Necessidades relacionadas ao projeto devem ser apresentadas exclusivamente pelos canais oficiais. Pedidos não autorizados não criam obrigação para o destinatário nem para a 11RUN.",
    "A solicitação não autorizada de dinheiro, ajuda ou vantagem constitui infração grave e resulta em desligamento imediato, comunicado ao responsável legal. Não se enquadram nessa proibição comunicações de emergência, pedidos de proteção, denúncias de abuso, exercício de direitos ou solicitações administrativas feitas pelos canais oficiais.",
    "O Onze Futuro é um projeto de base e desenvolvimento integral, não um programa de profissionalização ou alto rendimento precoce. A saúde, a educação, o descanso, a infância e o bem-estar permanecem acima do desempenho.",
    "É proibido participar sem inscrição regular; usar inscrição ou identidade de terceiro; alterar ou falsificar documento, idade, resultado ou informação; disputar prova incompatível com idade, distância ou regulamento; correr sem supervisão quando houver risco ou exigência de acompanhamento; ou participar contra orientação médica ou regra oficial. A 11RUN não autoriza, estimula, divulga nem valida resultados obtidos nessas condições.",
    "A participação em competições deve respeitar as normas vigentes da CBAt, o regulamento específico do evento e a autorização e supervisão do responsável legal quando aplicável.",
    "A família ou a 11RUN podem encerrar a participação a qualquer tempo. A 11RUN pode realizar suspensão preventiva ou desligamento imediato, sem obrigação de apresentar motivação detalhada, especialmente diante de solicitação indevida de dinheiro ou ajuda, contato impróprio com parceiros, fraude, prova irregular, uso indevido da marca, exposição ou risco para crianças, preconceito, assédio, violência ou ilegalidade.",
    "Todo desligamento será comunicado ao responsável legal e deverá preservar dignidade, privacidade, não discriminação e melhor interesse da criança, sem retaliação ou exposição pública. Benefícios e acessos futuros podem ser encerrados, mantendo-se os registros necessários à segurança, prestação de contas, obrigações legais e exercício de direitos.",
    "O tratamento de dados e imagens observará a Política de Privacidade, o melhor interesse da criança e os direitos de acesso, correção, revisão, revogação e eliminação quando legalmente aplicáveis. Mudanças materiais deste termo poderão exigir novo aceite do responsável."
  ]
} as const;

export const onzeFuturoPolicySections = [
  {
    id: "natureza",
    title: "Projeto complementar e sem vínculo",
    intro: "A 11RUN ajuda a conectar e organizar oportunidades sem assumir o lugar de quem já cuida da trajetória do atleta.",
    items: onzeFuturoTerm.clauses.slice(0, 6)
  },
  {
    id: "redes-e-marca",
    title: "Redes sociais, marca e relacionamentos",
    intro: "Quando a 11RUN aparece, a publicação também comunica algo sobre o projeto.",
    items: onzeFuturoTerm.clauses.slice(6, 8)
  },
  {
    id: "solicitacoes",
    title: "Dinheiro, ajuda e vantagens",
    intro: "A relação criada pelo projeto nunca pode ser usada para abordagens financeiras particulares.",
    items: onzeFuturoTerm.clauses.slice(8, 11)
  },
  {
    id: "seguranca-e-provas",
    title: "Treinos, segurança e competições",
    intro: "Formação de base exige proteção, supervisão e respeito às regras de cada idade.",
    items: onzeFuturoTerm.clauses.slice(11, 14)
  },
  {
    id: "desligamento",
    title: "Suspensão e desligamento",
    intro: "Situações graves podem exigir afastamento imediato, sempre com comunicação ao responsável.",
    items: onzeFuturoTerm.clauses.slice(14, 17)
  }
] as const;

export function onzeFuturoTermSnapshot() {
  return JSON.stringify(onzeFuturoTerm);
}
