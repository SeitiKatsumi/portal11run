import { AlexLopesAdmin } from "@/components/AlexLopesAdmin";
import { listAlexLopesApplications } from "@/lib/alex-lopes";

export default async function AlexLopesAdminPage() {
  const applications = await listAlexLopesApplications();
  return <main className="admin-panel alex-admin-page"><AlexLopesAdmin initialApplications={applications} /></main>;
}
