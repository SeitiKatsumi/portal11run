import { createProjectMetadata, ProjectPageTemplate } from "@/components/ProjectPageTemplate";
import { projectByRoute } from "@/lib/content";

export const metadata = createProjectMetadata(projectByRoute.bolsas);

export default function Page() {
  return <ProjectPageTemplate project={projectByRoute.bolsas} />;
}
