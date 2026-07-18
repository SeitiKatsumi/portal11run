import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export type AlexLopesApplication = {
  id: string;
  createdAt: string;
  status: "Recebido" | "Em contato" | "Avaliado" | "Arquivado";
  fullName: string;
  birthDate: string;
  cityState: string;
  profession: string;
  height: string;
  weight: string;
  healthConditions: string;
  medications: string;
  recentCheckup: string;
  allergies: string;
  supplements: string;
  injuries: string;
  nutrition: string;
  otherActivities: string;
  discoveredMethodology: string;
  runningExperience: string;
  currentTrainingDays: string;
  desiredTrainingDays: string;
  trainingPeriod: string;
  runningTest: string;
  previousCoach: string;
  coachChangeReason: string;
  bestResults: string;
  yearlyGoals: string;
  weeklyVolumeAndBestWorkout: string;
  longTermGoals: string;
  currentTrainingRoutine: string;
  availableRoutes: string;
  instagram: string;
  email: string;
  motivationAndPreferences: string;
  aboutYou: string;
  methodologyConsent: boolean;
  socialConsent: boolean;
  teamProfileConsent: boolean;
};

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "alex-lopes-applications.json");

function ensureStore() {
  if (!fs.existsSync(dataDirectory)) fs.mkdirSync(dataDirectory, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]", "utf8");
}

export function listAlexLopesApplications(): AlexLopesApplication[] {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8")) as AlexLopesApplication[];
  } catch {
    return [];
  }
}

function writeApplications(applications: AlexLopesApplication[]) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(applications, null, 2), "utf8");
}

export function createAlexLopesApplication(
  input: Omit<AlexLopesApplication, "id" | "createdAt" | "status">,
) {
  const application: AlexLopesApplication = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "Recebido",
    ...input,
  };
  const applications = listAlexLopesApplications();
  applications.unshift(application);
  writeApplications(applications);
  return application;
}

export function updateAlexLopesApplication(id: string, updates: Partial<AlexLopesApplication>) {
  const applications = listAlexLopesApplications();
  const index = applications.findIndex((application) => application.id === id);
  if (index === -1) return null;
  applications[index] = { ...applications[index], ...updates, id };
  writeApplications(applications);
  return applications[index];
}
