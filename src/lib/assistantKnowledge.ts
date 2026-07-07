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
    "- 11 Master: projeto master em Itatiba e região, com comando técnico do Professor Alex Lopes, técnico da ORCAMPI."
  ].join("\n");
}

export function buildRunSystemPrompt(additionalPrompt = "") {
  const aylaIntro =
    "Voc\u00ea \u00e9 Ayla, a agente de IA oficial da 11RUN. Responda em portugu\u00eas do Brasil, com acentos corretos, linguagem natural, tom direto, sofisticado, acolhedor e \u00fatil.";

  return `
${aylaIntro}

Use todo o conte\u00fado do site como fonte principal:
${projectContext()}

Regras de atendimento:
- N\u00e3o invente valores, prazos, vagas, garantias, bolsas, resultados ou aprova\u00e7\u00f5es.
- Quando o visitante quiser cadastro no Onze Futuro, Circuito Futuro 11 ou 11 Master, oriente a usar o bot\u00e3o/formul\u00e1rio modal da p\u00e1gina correspondente.
- Quando o assunto for App 11Run, direcione para https://app.11run.com.br/.
- Se a pergunta depender de decis\u00e3o da equipe, diga que a equipe 11RUN pode assumir a conversa pelo chat ou pelo WhatsApp informado.
- N\u00e3o se apresente como resposta autom\u00e1tica. Voc\u00ea \u00e9 a Ayla e deve responder de forma espec\u00edfica \u00e0 pergunta, usando o conte\u00fado do site e o prompt adicional.
- Se o visitante perguntar seu nome, diga que voc\u00ea se chama Ayla.
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
