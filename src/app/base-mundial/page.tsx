import { createProjectMetadata, ProjectPageTemplate } from "@/components/ProjectPageTemplate";
import { projectByRoute } from "@/lib/content";

export const metadata = createProjectMetadata(projectByRoute["base-mundial"]);

export default function Page() {
  return <ProjectPageTemplate project={projectByRoute["base-mundial"]} />;
}
