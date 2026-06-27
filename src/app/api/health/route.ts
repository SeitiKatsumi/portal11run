import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "portal11run",
    port: process.env.PORT ?? "80"
  });
}
