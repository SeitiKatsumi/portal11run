import { createProjectMetadata, ProjectPageTemplate } from "@/components/ProjectPageTemplate";
import { projectByRoute } from "@/lib/content";

export const metadata = createProjectMetadata(projectByRoute["circuito-futuro-11"]);

export default function Page() {
  return <ProjectPageTemplate project={projectByRoute["circuito-futuro-11"]} />;
}
