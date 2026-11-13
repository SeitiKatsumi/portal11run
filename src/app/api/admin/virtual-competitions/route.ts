import { NextResponse } from "next/server";
import {
  competitionAdminData,
  createVirtualChallengeEdition,
  listVirtualChallengeEditions,
  registerVirtualChallengeAthlete
} from "@/lib/competitions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function payload(competitionId?: string) {
  const editions = listVirtualChallengeEditions();
  const selectedId = competitionId && editions.some((edition) => edition.id === competitionId) ? competitionId : editions[0]?.id;
  return { editions, selectedId: selectedId ?? null, selected: selectedId ? competitionAdminData(selectedId) : null };
}

export async function GET(request: Request) {
  try {
    return NextResponse.json({ ok: true, ...payload(new URL(request.url).searchParams.get("competition_id") ?? undefined) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível carregar as edições." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action ?? "");
    if (action === "create_edition") {
      const edition = createVirtualChallengeEdition({ title: String(body.title ?? ""), location: String(body.location ?? ""), eventDate: String(body.eventDate ?? "") });
      return NextResponse.json({ ok: true, result: edition, ...payload(edition.id) });
    }
    if (action === "register_athlete") {
      const entry = registerVirtualChallengeAthlete({
        competitionId: String(body.competitionId ?? ""),
        name: String(body.name ?? ""),
        age: Number(body.age),
        gender: String(body.gender ?? ""),
        city: String(body.city ?? "")
      });
      return NextResponse.json({ ok: true, result: entry, ...payload(entry.competition_id) });
    }
    throw new Error("Ação inválida.");
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível salvar." }, { status: 400 });
  }
}
