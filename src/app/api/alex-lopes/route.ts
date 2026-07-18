import { NextResponse } from "next/server";
import { createAlexLopesApplication } from "@/lib/alex-lopes";

type AlexLopesApplicationInput = Parameters<typeof createAlexLopesApplication>[0];

const fields = [
  "fullName", "birthDate", "cityState", "profession", "height", "weight", "healthConditions",
  "medications", "recentCheckup", "allergies", "supplements", "injuries", "nutrition",
  "otherActivities", "discoveredMethodology", "runningExperience", "currentTrainingDays",
  "desiredTrainingDays", "trainingPeriod", "runningTest", "previousCoach", "coachChangeReason",
  "bestResults", "yearlyGoals", "weeklyVolumeAndBestWorkout", "longTermGoals", "currentTrainingRoutine",
  "availableRoutes", "instagram", "email", "motivationAndPreferences", "aboutYou",
] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.fullName?.trim() || !body.email?.trim() || !body.methodologyConsent) {
      return NextResponse.json(
        { error: "Preencha nome, e-mail e o aceite obrigatório." },
        { status: 400 },
      );
    }

    const application = createAlexLopesApplication({
      ...Object.fromEntries(
        fields.map((field) => [field, String(body[field] ?? "").trim()]),
      ),
      methodologyConsent: Boolean(body.methodologyConsent),
      socialConsent: Boolean(body.socialConsent),
      teamProfileConsent: Boolean(body.teamProfileConsent),
    } as AlexLopesApplicationInput);

    return NextResponse.json({ application }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível enviar o cadastro agora." },
      { status: 500 },
    );
  }
}
