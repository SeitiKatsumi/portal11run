import { NextResponse } from "next/server";
import {
  createChallengeBadge,
  getChallengeAdminData,
  reviewChallengeBenefit,
  reviewChallengeIdea,
  reviewChallengeSubmission,
  softDeleteChallengeFile,
  updateChallengeBadge,
  updateChallengeSettings
} from "@/lib/member-challenges";
import { clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return NextResponse.json({ ok: true, data: getChallengeAdminData({ status: params.get("status") || undefined, type: params.get("type") || undefined, accountId: params.get("accountId") || undefined }) });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const actor = `admin:${process.env.ADMIN_USER || "admin"}`;
    const ip = clientIp(request);
    if (body.action === "review-submission") reviewChallengeSubmission({ id: String(body.id), status: String(body.status), correctedValue: body.correctedValue === "" || body.correctedValue === undefined ? undefined : Number(body.correctedValue), notes: body.notes, actor, ip });
    else if (body.action === "review-idea") reviewChallengeIdea({ id: String(body.id), status: String(body.status), response: body.response, actor, ip });
    else if (body.action === "review-benefit") reviewChallengeBenefit({ id: String(body.id), approved: body.approved === true, validFrom: body.validFrom, validUntil: body.validUntil, notes: body.notes, actor, ip });
    else if (body.action === "update-settings") updateChallengeSettings(body.configuration ?? {}, actor, ip);
    else if (body.action === "update-badge") updateChallengeBadge({ id: String(body.id), name: body.name, description: body.description, icon: body.icon, active: body.active }, actor, ip);
    else if (body.action === "create-badge") createChallengeBadge({ name: body.name, description: body.description, icon: body.icon, challengeType: body.challengeType, requirement: body.requirement }, actor, ip);
    else if (body.action === "delete-file") softDeleteChallengeFile(String(body.id), actor, ip);
    else throw new Error("Ação administrativa inválida.");
    return NextResponse.json({ ok: true, data: getChallengeAdminData() });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Falha ao atualizar desafios." }, { status: 400 });
  }
}
