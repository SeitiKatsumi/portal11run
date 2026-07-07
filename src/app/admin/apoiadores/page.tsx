import { SupportAdminBoard } from "@/components/SupportAdminBoard";
import { listSupportInterests } from "@/lib/support";

export const dynamic = "force-dynamic";

export default function SupportAdminPage() {
  const interests = listSupportInterests();

  return (
    <section className="admin-panel">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Interessados em apoiar</span>
          <h1>Apoio, voluntários e patrocinadores</h1>
          <p>Mensagens recebidas pelo formulário Apoie o projeto, organizadas por etapa de acompanhamento.</p>
        </div>
        <div className="support-admin-summary">
          <span>Total recebido</span>
          <strong>{interests.length}</strong>
        </div>
      </div>
      <SupportAdminBoard initialInterests={interests} />
    </section>
  );
}
