import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createAlexLopesApplication } from "@/lib/alex-lopes";

type AlexLopesApplicationInput = Parameters<typeof createAlexLopesApplication>[0];

const audioExtensions: Record<string, string> = {
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/ogg": ".ogg",
  "audio/webm": ".webm",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav"
};

function uploadRoot() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? process.env.UPLOAD_PATH ?? "data/uploads");
}

async function saveTrainingAudio(file: File) {
  if (!file.size) return "";
  if (file.size > 15 * 1024 * 1024) throw new Error("O áudio deve ter no máximo 15 MB.");
  const extension = audioExtensions[file.type];
  if (!extension) throw new Error("Envie o áudio em MP3, M4A, OGG, WebM ou WAV.");
  await mkdir(uploadRoot(), { recursive: true });
  const fileName = `alex-training-${randomUUID()}${extension}`;
  await writeFile(path.join(uploadRoot(), fileName), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${fileName}`;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const value = (name: string) => String(form.get(name) ?? "").trim();

    if (!value("fullName") || !value("email") || value("methodologyConsent") !== "sim") {
      return NextResponse.json(
        { error: "Preencha nome, e-mail e o aceite obrigatório." },
        { status: 400 },
      );
    }

    const audio = form.get("trainingAudio");
    const application = createAlexLopesApplication({
      fullName: value("fullName"),
      birthDate: value("birthDate"),
      cityState: value("cityState"),
      profession: value("profession"),
      height: value("height"),
      weight: value("weight"),
      healthConditions: value("healthConditions"),
      medications: value("medications"),
      recentCheckup: value("checkup"),
      allergies: value("allergies"),
      supplements: value("supplements"),
      injuries: value("injuries"),
      nutrition: value("nutrition"),
      otherActivities: value("otherActivities"),
      discoveredMethodology: value("howHeard"),
      runningExperience: value("runningExperience"),
      currentTrainingDays: value("currentRoutine"),
      desiredTrainingDays: value("desiredRoutine"),
      trainingPeriod: value("trainingPeriod"),
      runningTest: value("raceTest"),
      previousCoach: value("previousCoach"),
      coachChangeReason: value("coachChangeReason"),
      bestResults: value("recentResults"),
      yearlyGoals: value("goals"),
      weeklyVolumeAndBestWorkout: value("weeklyVolume"),
      longTermGoals: value("longTermGoals"),
      currentTrainingRoutine: value("trainingDetails"),
      availableRoutes: value("trainingRoutes"),
      instagram: value("instagram"),
      email: value("email"),
      motivationAndPreferences: value("motivation"),
      trainingPreference: value("trainingPreference"),
      aboutYou: value("aboutYou"),
      trainingAudioUrl: audio instanceof File ? await saveTrainingAudio(audio) : "",
      methodologyConsent: true,
      socialConsent: value("socialConsent") === "sim",
      teamProfileConsent: value("teamProfileConsent") === "sim"
    } as AlexLopesApplicationInput);

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível enviar o cadastro agora." },
      { status: 500 },
    );
  }
}
