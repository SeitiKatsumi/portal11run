import Link from "next/link";
import { CheckCircle2, Clock3, PackageCheck } from "lucide-react";
import { syncStripeSession } from "@/lib/stripe";
import { orderStatusLabels } from "@/lib/store";
import styles from "../store.module.css";

export const dynamic = "force-dynamic";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

export default async function StoreSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sessionId = (await searchParams).session_id;
  const order = sessionId ? await syncStripeSession(sessionId).catch(() => undefined) : undefined;
  const paid = order?.payment_status === "pago";

  return (
    <main className={styles.successPage}>
      <section className={styles.successCard}>
        <span className={styles.successIcon}>{paid ? <CheckCircle2 /> : <Clock3 />}</span>
        <span className="eyebrow">Pedido recebido</span>
        <h1>{paid ? "Pagamento aprovado." : "Estamos confirmando seu pagamento."}</h1>
        <p>
          {paid
            ? "Obrigado por vestir a 11RUN. A equipe já recebeu seu pedido e iniciará a preparação para o envio."
            : "Assim que a Stripe confirmar o pagamento, o pedido aparecerá como aprovado para nossa equipe."}
        </p>

        {order ? (
          <div className={styles.successOrder}>
            <div><span>Pedido</span><strong>#{order.id.slice(0, 8).toUpperCase()}</strong></div>
            <div><span>Total</span><strong>{currency(order.total_cents)}</strong></div>
            <div><span>Status</span><strong>{orderStatusLabels[order.order_status]}</strong></div>
          </div>
        ) : null}

        <div className={styles.successNext}>
          <PackageCheck size={20} />
          <span>Você receberá as atualizações do pedido pelos dados informados no checkout.</span>
        </div>
        <Link className={styles.primaryButton} href="/apoie-o-projeto">Voltar para a loja</Link>
      </section>
    </main>
  );
}
