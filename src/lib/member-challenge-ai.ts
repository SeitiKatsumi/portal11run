import { getChatSettings } from "./assistantStore";
import {
  getChallengeSettings,
  getSchoolSubmissionForAi,
  markSchoolAiFailure,
  readChallengeFile,
  saveSchoolAiAnalysis
} from "./member-challenges";

type SchoolAnalysis = {
  studentName: string;
  school: string;
  period: string;
  gradingScale: string;
  subjects: Array<{ name: string; score: number; maximumScore: number }>;
  reportedAverage: number | null;
  imageQuality: "GOOD" | "READABLE" | "POOR";
  confidence: number;
  warnings: string[];
};

function outputText(payload: unknown) {
  const data = payload as { output_text?: unknown; output?: Array<{ content?: Array<{ text?: unknown }> }> };
  if (typeof data.output_text === "string") return data.output_text;
  return data.output?.flatMap((item) => item.content ?? []).map((item) => typeof item.text === "string" ? item.text : "").join("") ?? "";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeAnalysis(analysis: SchoolAnalysis) {
  const normalizedSubjects = analysis.subjects
    .filter((subject) => subject.name.trim() && Number.isFinite(subject.score) && Number.isFinite(subject.maximumScore) && subject.maximumScore > 0)
    .map((subject) => ({
      name: subject.name.trim().slice(0, 120),
      originalScore: subject.score,
      originalMaximum: subject.maximumScore,
      score: Number(clamp((subject.score / subject.maximumScore) * 10, 0, 10).toFixed(2))
    }));
  const calculatedAverage = normalizedSubjects.length
    ? Number((normalizedSubjects.reduce((total, subject) => total + subject.score, 0) / normalizedSubjects.length).toFixed(2))
    : analysis.reportedAverage === null ? null : Number(clamp(analysis.reportedAverage, 0, 10).toFixed(2));
  const settings = getChallengeSettings();
  const band = calculatedAverage === null
    ? { benefit: 0, points: 0 }
    : settings.schoolBands.find((item) => calculatedAverage >= item.min && calculatedAverage <= item.max) ?? { benefit: 0, points: 0 };
  const warnings = [...analysis.warnings];
  if (!analysis.studentName.trim()) warnings.push("Nome do aluno não localizado.");
  if (!analysis.period.trim()) warnings.push("Trimestre ou período não identificado.");
  if (!normalizedSubjects.length) warnings.push("Notas numéricas não puderam ser normalizadas.");
  if (analysis.imageQuality === "POOR") warnings.push("Documento com baixa legibilidade.");
  return {
    normalized: {
      studentName: analysis.studentName.trim(),
      school: analysis.school.trim(),
      period: analysis.period.trim(),
      gradingScale: analysis.gradingScale.trim(),
      subjects: normalizedSubjects,
      average: calculatedAverage,
      imageQuality: analysis.imageQuality
    },
    confidence: clamp(Number(analysis.confidence) || 0, 0, 1),
    warnings: [...new Set(warnings.map((warning) => warning.trim()).filter(Boolean))],
    suggestedScore: band.points,
    suggestedBenefit: band.benefit
  };
}

export async function processSchoolSubmissionWithAi(submissionId: string) {
  const submission = getSchoolSubmissionForAi(submissionId);
  if (!submission) throw new Error("Submissão escolar não encontrada.");
  const settings = getChatSettings();
  const apiKey = settings.openai_api_key?.trim() || process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_DOCUMENT_MODEL?.trim() || settings.openai_model?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
  if (!apiKey) {
    markSchoolAiFailure(submissionId, model, "A chave padrão de IA não está disponível no servidor.");
    return { ok: false, requiresHumanReview: true };
  }
  try {
    const { bytes } = await readChallengeFile(submission.file_id);
    const dataUrl = `data:${submission.mime_type};base64,${bytes.toString("base64")}`;
    const documentContent = submission.mime_type === "application/pdf"
      ? { type: "input_file", filename: submission.original_name, file_data: dataUrl }
      : { type: "input_image", image_url: dataUrl, detail: "high" };
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        store: false,
        input: [{
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analise o boletim escolar anexado de forma assistiva. Identifique apenas informações visíveis: aluno, escola, período, escala e notas. Não invente dados. O período declarado é ${submission.period_reference}. Retorne confiança de 0 a 1 e alertas para documento cortado, desfocado, ilegível, escala incomum, nome ausente, período ausente ou possível inconsistência. Decisões financeiras sempre serão humanas.`
            },
            documentContent
          ]
        }],
        text: {
          format: {
            type: "json_schema",
            name: "school_report_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                studentName: { type: "string" },
                school: { type: "string" },
                period: { type: "string" },
                gradingScale: { type: "string" },
                subjects: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      score: { type: "number" },
                      maximumScore: { type: "number" }
                    },
                    required: ["name", "score", "maximumScore"],
                    additionalProperties: false
                  }
                },
                reportedAverage: { anyOf: [{ type: "number" }, { type: "null" }] },
                imageQuality: { type: "string", enum: ["GOOD", "READABLE", "POOR"] },
                confidence: { type: "number" },
                warnings: { type: "array", items: { type: "string" } }
              },
              required: ["studentName", "school", "period", "gradingScale", "subjects", "reportedAverage", "imageQuality", "confidence", "warnings"],
              additionalProperties: false
            }
          }
        },
        max_output_tokens: 3500
      }),
      signal: AbortSignal.timeout(60_000)
    });
    if (!response.ok) throw new Error(`A análise respondeu com HTTP ${response.status}.`);
    const rawText = outputText(await response.json());
    if (!rawText) throw new Error("A análise não retornou dados estruturados.");
    const extracted = JSON.parse(rawText) as SchoolAnalysis;
    const result = normalizeAnalysis(extracted);
    saveSchoolAiAnalysis(submissionId, {
      model,
      extracted,
      normalized: result.normalized,
      confidence: result.confidence,
      warnings: result.warnings,
      suggestedScore: result.suggestedScore,
      suggestedBenefit: result.suggestedBenefit,
      status: "COMPLETED"
    });
    return { ok: true, requiresHumanReview: result.confidence < getChallengeSettings().aiConfidenceThreshold, ...result };
  } catch (error) {
    markSchoolAiFailure(submissionId, model, error instanceof Error ? error.message : "Falha não identificada na análise.");
    return { ok: false, requiresHumanReview: true };
  }
}
