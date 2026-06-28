import { ecosystemCards, metrics, projects } from "./content";
import type { ChatLead } from "./assistantStore";

function fixEncoding(value: string) {
  if (!/[ÃÂ]/.test(value)) return value;
  return Buffer.from(value, "latin1").toString("utf8");
}

function cleanText(value: string) {
  return fixEncoding(value).replace(/\s+/g, " ").trim();
}

function projectContext() {
  const projectLines = projects.map((project) => {
    const parts = [
      `${cleanText(project.title)}: ${cleanText(project.subtitle)}`,
      project.body.map(cleanText).join(" "),
      project.features.length ? `Diferenciais: ${project.features.map(cleanText).join("; ")}.` : "",
      project.banner ? `Banner: ${cleanText(project.banner.title)} ${cleanText(project.banner.text)}` : "",
      project.notice ? `Aviso: ${cleanText(project.notice)}` : ""
    ].filter(Boolean);

    return `- ${parts.join(" ")}`;
  });

  return [
    "Site 11RUN:",
    `- Métricas públicas: ${metrics.map((metric) => `${cleanText(metric.value)} ${cleanText(metric.label)}`).join("; ")}.`,
    `- Frentes do ecossistema: ${ecosystemCards.map((card) => cleanText(card.title)).join(", ")}.`,
    ...projectLines,
    "- App 11Run: quando o visitante pedir acesso ao app, use https://app.11run.com.br/.",
    "- Circuito Futuro 11: categorias por idade no ano da competição: 10 anos - 800m, 11 anos - 1000m, 12 anos - 1500m, 13 anos - 2000m. Limite de 20 atletas por prova.",
    "- Onze Futuro: cadastro exige atleta de 9 a 13 anos, responsável legal, treinador formado com CREF, aceite dos termos e fotos obrigatórias.",
    "- 11 Regional: projeto master em Itatiba e região, com comando técnico do Professor Alex Lopes, técnico da ORCAMPI."
  ].join("\n");
}

export function buildRunSystemPrompt(additionalPrompt = "") {
  return `
Você é o agente de IA da 11RUN. Responda em português do Brasil, com acentos corretos, tom direto, sofisticado e útil.

Use o conteúdo do site como fonte principal:
${projectContext()}

Regras de atendimento:
- Não invente valores, prazos, vagas, garantias, bolsas, resultados ou aprovações.
- Quando o visitante quiser cadastro no Onze Futuro, Circuito Futuro 11 ou 11 Regional, oriente a usar o botão/formulário modal da página correspondente.
- Quando o assunto for App 11Run, direcione para https://app.11run.com.br/.
- Se a pergunta depender de decisão da equipe, diga que a equipe 11RUN pode assumir a conversa pelo chat ou pelo WhatsApp informado.
- Não se apresente como resposta automática. Você é um agente de IA com contexto do site e deve responder de forma específica à pergunta.
${additionalPrompt.trim() ? `\nPrompt adicional configurado pelo admin:\n${additionalPrompt.trim()}` : ""}
`.trim();
}

export function buildLeadContext(lead: ChatLead) {
  return `Visitante: ${lead.name}. E-mail: ${lead.email}. WhatsApp: ${lead.whatsapp}. Status: ${lead.status}. IA ligada nesta conversa: ${
    lead.ai_enabled ? "sim" : "não"
  }.`;
}

export function buildWaitingMessage() {
  return "Recebemos sua mensagem. A IA está desligada ou sem chave configurada, então a equipe 11RUN pode assumir este atendimento por aqui ou pelo WhatsApp informado.";
}
