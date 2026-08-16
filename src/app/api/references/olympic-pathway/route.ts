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
    const narratives = {
      starting: { title: "A largada já aconteceu!", text: "Existe uma chance — e o futuro adora pregar peças. Continue correndo: até campeões começaram sem saber onde a pista terminava." },
      moving: { title: "Seu sonho colocou o tênis.", text: "A jornada está em movimento! Agora vale colecionar treinos, histórias e aquele cabelo bagunçado de quem correu de verdade." },
      international: { title: "O radar internacional fez bip!", text: "Sua marca apareceu entre referências fortes. Ninguém precisa arrumar a mala hoje, mas o sonho olímpico acaba de ganhar passaporte." },
      promising: { title: "A chama olímpica piscou para você.", text: "Você desbloqueou uma rota muito promissora. Siga com saúde, diversão e consistência — superpoder também precisa de descanso." },
      extraordinary: { title: "Alerta: marca fora da curva!", text: "Seu resultado entrou em uma zona raríssima. O sonho está vivíssimo; agora deixe a evolução correr sem esquecer de brincar." }
    } as const;
    const narrative = analysis.potentialBand ? narratives[analysis.potentialBand] : { title: "A próxima fase ainda está carregando.", text: "Os rankings ainda estão montando o mapa. Volte em breve: até videogame precisa carregar a próxima fase." };
    return NextResponse.json({ analysis, input, limitations: [], narrative });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível concluir a análise.";
    return NextResponse.json({ error: message }, { status: message.startsWith("Muitas") ? 429 : 500 });
  }
}
