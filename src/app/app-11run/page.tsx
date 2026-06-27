import { createProjectMetadata, ProjectPageTemplate } from "@/components/ProjectPageTemplate";
import { projectByRoute } from "@/lib/content";

export const metadata = createProjectMetadata(projectByRoute["app-11run"]);

export default function Page() {
  return <ProjectPageTemplate project={projectByRoute["app-11run"]} />;
}
