import { NextResponse } from "next/server";
import { CIRCUIT_SUBMISSION_TYPES, type CircuitGender, type CircuitSubmissionType } from "@/lib/virtual-circuit-core";
import { listCircuitRanking } from "@/lib/virtual-circuit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const age = Number(params.get("age"));
  const gender = params.get("gender");
  const type = params.get("type");
  const state = params.get("state")?.toUpperCase();
  const ranking = listCircuitRanking({
    categoryAge: age >= 9 && age <= 13 ? age : undefined,
    gender: gender === "FEMALE" || gender === "MALE" ? (gender as CircuitGender) : undefined,
    type: CIRCUIT_SUBMISSION_TYPES.includes(type as CircuitSubmissionType) ? (type as CircuitSubmissionType) : undefined,
    state: state && /^[A-Z]{2}$/.test(state) ? state : undefined,
    name: params.get("name")?.slice(0, 100) || undefined,
    start: params.get("start") || undefined,
    end: params.get("end") || undefined
  });
  return NextResponse.json({ ok: true, ranking });
}
