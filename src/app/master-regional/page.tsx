import { createProjectMetadata, ProjectPageTemplate } from "@/components/ProjectPageTemplate";
import { projectByRoute } from "@/lib/content";

export const metadata = createProjectMetadata(projectByRoute["master-regional"]);

export default function Page() {
  return <ProjectPageTemplate project={projectByRoute["master-regional"]} />;
}
