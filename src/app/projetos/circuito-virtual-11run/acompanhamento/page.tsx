import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { CircuitCorrectionForm } from "@/components/CircuitCorrectionForm";
import { getGuardianDashboard } from "@/lib/virtual-circuit";
import styles from "../virtual-circuit.module.css";

export const metadata: Metadata = { title: "Acompanhamento | Circuito Virtual 11Run", robots: { index: false, follow: false } };

const statusLabels: Record<string, string> = {
  SUBMITTED: "Recebida", AI_PROCESSING: "Em análise automática", UNDER_REVIEW: "Em análise",
  CORRECTION_REQUESTED: "Correção solicitada", APPROVED: "Aprovada", REJECTED: "Rejeitada",
  DISQUALIFIED: "Desclassificada", WITHDRAWN: "Retirada"
};

export default async function GuardianCircuitPage() {
  const token = (await cookies()).get("circuit_guardian")?.value;
  const dashboard = getGuardianDashboard(token);
  return <>
    <div className={styles.page}>
      <section className={styles.section}>
        <span className={styles.eyebrow}>Área do responsável</span>
        <h2>Acompanhe cada marca enviada.</h2>
        {!dashboard ? <div>
          <p>Seu acesso seguro não foi encontrado ou expirou. Ao concluir uma inscrição, o acesso é liberado automaticamente neste dispositivo.</p>
          <Link className={styles.primaryButton} href="/projetos/circuito-virtual-11run#inscricao">Fazer uma inscrição</Link>
        </div> : <div>
          <p>Responsável: <strong>{dashboard.guardian.full_name}</strong> · {dashboard.guardian.email}</p>
          <div className={styles.steps}>
            {dashboard.athletes.map((athlete) => <article key={String(athlete.id)}>
              <span>Atleta</span><h3>{athlete.public_name}</h3><p>{athlete.category_age} anos · {athlete.gender === "FEMALE" ? "Feminino" : "Masculino"} · {athlete.city}/{athlete.state}</p>
            </article>)}
          </div>
          <div className={styles.accordion}>
            {dashboard.submissions.map((submission) => <details key={String(submission.id)}>
              <summary>{submission.formattedTime} · {submission.activity_date} · {statusLabels[String(submission.status)] || submission.status}</summary>
              <p>Modalidade: {String(submission.submission_type).replaceAll("_", " ")}.</p>
              {submission.correction_message ? <p><strong>Correção solicitada:</strong> {submission.correction_message}</p> : null}
              {submission.status === "CORRECTION_REQUESTED" ? <CircuitCorrectionForm submissionId={submission.id} /> : null}
              {submission.rejection_reason ? <p><strong>Justificativa:</strong> {submission.rejection_reason}</p> : null}
            </details>)}
            {!dashboard.submissions.length ? <p>Nenhuma atividade enviada.</p> : null}
          </div>
        </div>}
      </section>
    </div>
  </>;
}
