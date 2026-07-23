import { HomeAdmin } from "@/components/HomeAdmin";
import { getHomeConfig } from "@/lib/home";

export default function AdminHomePage() {
  const { settings, projects } = getHomeConfig({ activeOnly: false });
  return <HomeAdmin initialSettings={settings} initialProjects={projects} />;
}
