import { NextResponse } from "next/server";
import { getInternationalRankingJob } from "@/lib/international-rankings";

export const dynamic = "force-dynamic";

export function GET(_: Request, context: { params: Promise<{ jobId: string }> }) {
  return context.params.then(({ jobId }) => {
    const job = getInternationalRankingJob(jobId);
    return job
      ? NextResponse.json(job)
      : NextResponse.json({ error: "Processamento não encontrado." }, { status: 404 });
  });
}
