import { NextRequest, NextResponse } from "next/server";
import { analyzeOlympicPathway, validatePathwayInput, type PathwayInput } from "@/lib/olympic-pathway/core";
import { loadOlympicPathwaySources } from "@/lib/olympic-pathway/sources";
import { assertRateLimit } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(request, "olympic-pathway", 12, 10 * 60 * 1000);
    const body = await request.json() as Partial<PathwayInput>;
    const checked = validatePathwayInput(body);
    if (!checked.valid) return NextResponse.json({ error: "Revise os campos informados.", fields: checked.errors }, { status: 400 });
    const input = body as PathwayInput;
    const sources = await loadOlympicPathwaySources(input);
    const analysis = analyzeOlympicPathway(input, sources);
    return NextResponse.json({ analysis, input, limitations: ["Compatibilidade histórica não é probabilidade individual.", "Posições são simulações sobre as listas internas disponíveis, não homologações oficiais.", "Desempenho juvenil possui baixa capacidade preditiva sobre o desempenho adulto."], narrative: { title: analysis.compatibility === null ? "Ainda não há comparação suficiente" : "Esta é a força da sua marca hoje.", text: analysis.compatibility === null ? "Nenhuma base interna suficientemente compatível estava sincronizada. Nenhum percentual foi produzido." : "O índice organiza referências competitivas atuais sem diagnosticar talento, selecionar atletas ou prever uma carreira." } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível concluir a análise.";
    return NextResponse.json({ error: message }, { status: message.startsWith("Muitas") ? 429 : 500 });
  }
}
