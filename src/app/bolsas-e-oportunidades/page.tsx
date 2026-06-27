import { createProjectMetadata, ProjectPageTemplate } from "@/components/ProjectPageTemplate";
import { projectByRoute } from "@/lib/content";

export const metadata = createProjectMetadata(projectByRoute["bolsas-e-oportunidades"]);

export default function Page() {
  return <ProjectPageTemplate project={projectByRoute["bolsas-e-oportunidades"]} />;
}
