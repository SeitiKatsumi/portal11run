import { NextResponse } from "next/server";
import { getHomeConfig } from "@/lib/home";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getHomeConfig());
}
