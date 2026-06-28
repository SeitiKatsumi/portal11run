import { ProjectFormModal } from "./ProjectFormModal";

export function OnzeFuturoModal({ label = "Cadastrar atleta" }: { label?: string }) {
  return <ProjectFormModal project="onze-futuro" label={label} />;
}
