import { NextResponse } from "next/server";
import {
  CROSS_COUNTRY_COMPETITION_ID,
  addManualFinish,
  armRace,
  assignBibNumber,
  assignBibNumbers,
  buildResults,
  homologateRace,
  importAcceptedCrossCountryEntries,
  listCompetitionEntries,
  listCompetitionRaces,
  previewBibAssignment,
  reopenRace,
  startRace,
  syncRaceFinishes,
  updateFinish
} from "@/lib/competitions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function state() {
  return {
    competitionId: CROSS_COUNTRY_COMPETITION_ID,
    races: listCompetitionRaces(),
    entries: listCompetitionEntries(),
    results: buildResults()
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const previewStart = url.searchParams.get("preview_bibs");
    return NextResponse.json({ ok: true, ...state(), ...(previewStart ? { preview: previewBibAssignment(Number(previewStart)) } : {}) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível carregar a competição." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action ?? "");
    let result: unknown;
    if (action === "import") result = importAcceptedCrossCountryEntries();
    else if (action === "assign_bibs") result = assignBibNumbers(Number(body.start));
    else if (action === "assign_bib") result = assignBibNumber(String(body.entryId ?? ""), Number(body.bibNumber));
    else if (action === "arm") result = armRace(String(body.raceId ?? ""), String(body.deviceId ?? ""));
    else if (action === "start") result = startRace(String(body.raceId ?? ""), String(body.deviceId ?? ""), Number(body.deviceEpochMs), "timer");
    else if (action === "sync") result = syncRaceFinishes(String(body.raceId ?? ""), Array.isArray(body.items) ? body.items as Parameters<typeof syncRaceFinishes>[1] : [], "timer");
    else if (action === "manual_finish") result = addManualFinish(String(body.raceId ?? ""), String(body.entryId ?? ""), Number(body.elapsedMs), "admin", String(body.reason ?? "Inclusão manual"));
    else if (action === "homologate") result = homologateRace(String(body.raceId ?? ""));
    else if (action === "reopen") result = reopenRace(String(body.raceId ?? ""), String(body.reason ?? ""));
    else throw new Error("Ação inválida.");
    return NextResponse.json({ ok: true, result, ...state() });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível atualizar a competição." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const result = updateFinish(String(body.finishId ?? ""), {
      ...(body.elapsedMs === undefined ? {} : { elapsedMs: Number(body.elapsedMs) }),
      ...(body.adjustmentMs === undefined ? {} : { adjustmentMs: Number(body.adjustmentMs) }),
      ...(body.manualRank === undefined ? {} : { manualRank: body.manualRank === null || body.manualRank === "" ? null : Number(body.manualRank) }),
      ...(body.resultStatus === undefined ? {} : { resultStatus: String(body.resultStatus) as Parameters<typeof updateFinish>[1]["resultStatus"] }),
      ...(body.status === undefined ? {} : { status: String(body.status) as Parameters<typeof updateFinish>[1]["status"] }),
      ...(body.entryId === undefined ? {} : { entryId: String(body.entryId) })
    }, "admin", String(body.reason ?? ""));
    return NextResponse.json({ ok: true, result, ...state() });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível editar o resultado." }, { status: 400 });
  }
}

