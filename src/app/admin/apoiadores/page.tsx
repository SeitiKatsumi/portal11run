import { AdminDataNotice } from "@/components/AdminDataNotice";
import { SupportAdminBoard } from "@/components/SupportAdminBoard";
import { safeAdminData } from "@/lib/adminSafeData";
import { listSupportInterests } from "@/lib/support";

export const dynamic = "force-dynamic";

export default function SupportAdminPage() {
  const interests = safeAdminData("interessados em apoiar", () => listSupportInterests(), []);

  return (
    <>
      <AdminDataNotice errors={interests.error ? [interests.error] : []} />
      <section className="admin-panel">
        <div className="admin-toolbar">
          <div>
            <span className="eyebrow">Interessados em apoiar</span>
            <h1>Apoio, voluntários e patrocinadores</h1>
            <p>Mensagens recebidas pelo formulário Apoie o projeto, organizadas por etapa de acompanhamento.</p>
          </div>
          <div className="support-admin-summary">
            <span>Total recebido</span>
            <strong>{interests.data.length}</strong>
          </div>
        </div>
        <SupportAdminBoard initialInterests={interests.data} />
      </section>
    </>
  );
}
