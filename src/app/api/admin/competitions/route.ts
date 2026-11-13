import { NextResponse } from "next/server";
import {
  CROSS_COUNTRY_COMPETITION_ID,
  addManualFinish,
  armRace,
  assignBibNumber,
  assignBibNumbers,
  buildResults,
  competitionIdForFinish,
  competitionIdForRace,
  homologateRace,
  importAcceptedCrossCountryEntries,
  listCompetitionEntries,
  listCompetitionRaces,
  pauseRace,
  previewBibAssignment,
  resetCompetition,
  resetRace,
  reopenRace,
  startRace,
  syncRaceFinishes,
  updateFinish
} from "@/lib/competitions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function state(competitionId = CROSS_COUNTRY_COMPETITION_ID) {
  return {
    competitionId,
    races: listCompetitionRaces(competitionId),
    entries: listCompetitionEntries(competitionId),
    results: buildResults(competitionId)
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const competitionId = url.searchParams.get("competition_id") || (url.searchParams.get("race_id") ? competitionIdForRace(String(url.searchParams.get("race_id"))) : CROSS_COUNTRY_COMPETITION_ID);
    const previewStart = url.searchParams.get("preview_bibs");
    return NextResponse.json({ ok: true, ...state(competitionId), ...(previewStart ? { preview: previewBibAssignment(Number(previewStart), competitionId) } : {}) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível carregar a competição." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action ?? "");
    const competitionId = body.competitionId ? String(body.competitionId) : body.raceId ? competitionIdForRace(String(body.raceId)) : CROSS_COUNTRY_COMPETITION_ID;
    let result: unknown;
    if (action === "import") {
      if (competitionId !== CROSS_COUNTRY_COMPETITION_ID) throw new Error("Esta edição usa cadastro direto de atletas.");
      result = importAcceptedCrossCountryEntries();
    }
    else if (action === "assign_bibs") result = assignBibNumbers(Number(body.start), "admin", competitionId);
    else if (action === "assign_bib") result = assignBibNumber(String(body.entryId ?? ""), Number(body.bibNumber));
    else if (action === "arm") result = armRace(String(body.raceId ?? ""), String(body.deviceId ?? ""));
    else if (action === "start") result = startRace(String(body.raceId ?? ""), String(body.deviceId ?? ""), Number(body.deviceEpochMs), "timer");
    else if (action === "pause") result = pauseRace(String(body.raceId ?? ""), String(body.deviceId ?? ""), Number(body.deviceEpochMs), "timer");
    else if (action === "reset") result = resetRace(String(body.raceId ?? ""), "admin", String(body.reason ?? ""));
    else if (action === "reset_competition") result = resetCompetition(competitionId, "admin", String(body.reason ?? ""));
    else if (action === "sync") result = syncRaceFinishes(String(body.raceId ?? ""), Array.isArray(body.items) ? body.items as Parameters<typeof syncRaceFinishes>[1] : [], "timer");
    else if (action === "manual_finish") result = addManualFinish(String(body.raceId ?? ""), String(body.entryId ?? ""), Number(body.elapsedMs), "admin", String(body.reason ?? "Inclusão manual"));
    else if (action === "homologate") result = homologateRace(String(body.raceId ?? ""));
    else if (action === "reopen") result = reopenRace(String(body.raceId ?? ""), String(body.reason ?? ""));
    else throw new Error("Ação inválida.");
    return NextResponse.json({ ok: true, result, ...state(competitionId) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível atualizar a competição." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const competitionId = body.competitionId ? String(body.competitionId) : competitionIdForFinish(String(body.finishId ?? ""));
    const result = updateFinish(String(body.finishId ?? ""), {
      ...(body.elapsedMs === undefined ? {} : { elapsedMs: Number(body.elapsedMs) }),
      ...(body.adjustmentMs === undefined ? {} : { adjustmentMs: Number(body.adjustmentMs) }),
      ...(body.manualRank === undefined ? {} : { manualRank: body.manualRank === null || body.manualRank === "" ? null : Number(body.manualRank) }),
      ...(body.resultStatus === undefined ? {} : { resultStatus: String(body.resultStatus) as Parameters<typeof updateFinish>[1]["resultStatus"] }),
      ...(body.status === undefined ? {} : { status: String(body.status) as Parameters<typeof updateFinish>[1]["status"] }),
      ...(body.entryId === undefined ? {} : { entryId: String(body.entryId) })
    }, "admin", String(body.reason ?? ""));
    return NextResponse.json({ ok: true, result, ...state(competitionId) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível editar o resultado." }, { status: 400 });
  }
}

