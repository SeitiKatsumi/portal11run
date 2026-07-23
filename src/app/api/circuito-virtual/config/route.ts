import { NextResponse } from "next/server";
import { getCircuitEdition } from "@/lib/virtual-circuit";

export const runtime = "nodejs";

export async function GET() {
  const edition = getCircuitEdition();
  return NextResponse.json({
    ok: true,
    edition: {
      id: edition.id,
      name: edition.name,
      description: edition.description,
      startDate: edition.start_date,
      endDate: edition.end_date,
      distanceMeters: edition.distance_meters,
      status: edition.status,
      regulationsVersion: edition.regulations_version,
      privacyVersion: edition.privacy_version,
      heroImage: edition.hero_image,
      settings: edition.settings
    }
  });
}
