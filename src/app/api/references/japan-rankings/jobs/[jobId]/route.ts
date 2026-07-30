import { NextResponse } from "next/server";
import { getJapanRankingJob } from "@/lib/japan-rankings";

export function GET(_request: Request, context: { params: Promise<{ jobId: string }> }) {
  return context.params.then(({ jobId }) => {
    const job = getJapanRankingJob(jobId);
    return job
      ? NextResponse.json(job)
      : NextResponse.json({ error: "Processamento não encontrado." }, { status: 404 });
  });
}
