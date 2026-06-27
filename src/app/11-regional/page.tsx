import { createProjectMetadata, ProjectPageTemplate } from "@/components/ProjectPageTemplate";
import { projectByRoute } from "@/lib/content";

export const metadata = createProjectMetadata(projectByRoute["11-regional"]);

export default function Page() {
  return <ProjectPageTemplate project={projectByRoute["11-regional"]} />;
}
