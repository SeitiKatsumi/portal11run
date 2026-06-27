import { createProjectMetadata, ProjectPageTemplate } from "@/components/ProjectPageTemplate";
import { projectByRoute } from "@/lib/content";

export const metadata = createProjectMetadata(projectByRoute["caminho-de-um-campeao"]);

export default function Page() {
  return <ProjectPageTemplate project={projectByRoute["caminho-de-um-campeao"]} />;
}
