import { NextResponse } from "next/server";
import { assertRateLimit } from "@/lib/request-guard";
import { createVolunteer, saveSupportFile } from "@/lib/support-hub";

export const runtime = "nodejs";

function checked(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

function jsonList(value: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "support-volunteer", 5, 15 * 60_000);
    const form = await request.formData();
    if (String(form.get("website") ?? "")) return NextResponse.json({ ok: true });
    const attachment = form.get("attachment");
    const attachmentFileId =
      attachment instanceof File && attachment.size
        ? await saveSupportFile(attachment, "VOLUNTEER_ATTACHMENT")
        : undefined;
    const record = await createVolunteer(
      {
        name: form.get("name"),
        birthDate: form.get("birthDate"),
        email: form.get("email"),
        phone: form.get("phone"),
        city: form.get("city"),
        state: form.get("state"),
        profession: form.get("profession"),
        otherProfession: form.get("otherProfession"),
        company: form.get("company"),
        professionalRegistration: form.get("professionalRegistration"),
        portfolioUrl: form.get("portfolioUrl"),
        presentation: form.get("presentation"),
        contributionTypes: jsonList(form.get("contributionTypes")),
        availableDays: form.get("availableDays"),
        periods: jsonList(form.get("periods")),
        frequency: form.get("frequency"),
        workMode: form.get("workMode"),
        travelDistance: form.get("travelDistance"),
        eventsTravel: checked(form.get("eventsTravel")),
        childExperience: form.get("childExperience"),
        sportExperience: form.get("sportExperience"),
        socialExperience: form.get("socialExperience"),
        motivation: form.get("motivation"),
        contributionDescription: form.get("contributionDescription"),
        consent: checked(form.get("consent")),
        truth: checked(form.get("truth")),
        contactAuthorization: checked(form.get("contactAuthorization"))
      },
      attachmentFileId
    );
    return NextResponse.json({ ok: true, ...record }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível registrar o voluntariado." },
      { status: 400 }
    );
  }
}
