import { randomBytes } from "node:crypto";
import Stripe from "stripe";
import {
  attachStripeSession,
  createOrder,
  getOrder,
  markOrderCheckoutFailed,
  markOrderPaid,
  markOrderPaymentFailed,
  type CartInput,
  type StoreOrder
} from "@/lib/store";

let stripeClient: Stripe | undefined;

export function stripeIsConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("O checkout está temporariamente indisponível.");
  if (!stripeClient) stripeClient = new Stripe(key, { maxNetworkRetries: 2 });
  return stripeClient;
}

function sessionCustomer(session: Stripe.Checkout.Session) {
  const shipping =
    (session as Stripe.Checkout.Session & {
      collected_information?: { shipping_details?: { name?: string; address?: unknown } };
      shipping_details?: { name?: string; address?: unknown };
    }).collected_information?.shipping_details ??
    (session as Stripe.Checkout.Session & { shipping_details?: { name?: string; address?: unknown } }).shipping_details;

  return {
    paymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
    customerName: shipping?.name ?? session.customer_details?.name ?? null,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    customerPhone: session.customer_details?.phone ?? null,
    shippingAddress: shipping?.address ?? session.customer_details?.address ?? null
  };
}

export async function createStripeCheckout(cart: CartInput[], siteUrl: string) {
  const stripe = getStripe();
  const order = createOrder(cart);
  const integrationIdentifier = `portal11run_${randomBytes(4).toString("hex")}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "pt-BR",
      customer_creation: "always",
      client_reference_id: order.id,
      integration_identifier: integrationIdentifier,
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "brl",
          unit_amount: item.unit_price_cents,
          product_data: {
            name: `${item.title} — ${item.size}`,
            metadata: {
              product_id: item.product_id,
              size: item.size
            }
          }
        }
      })),
      shipping_address_collection: { allowed_countries: ["BR"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: "Frete padrão",
            fixed_amount: { amount: order.shipping_cents, currency: "brl" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 12 }
            }
          }
        }
      ],
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      metadata: { order_id: order.id },
      payment_intent_data: { metadata: { order_id: order.id } },
      success_url: `${siteUrl}/apoie-o-projeto/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/apoie-o-projeto?checkout=cancelado`
    });

    if (!session.url) throw new Error("A Stripe não retornou uma URL de pagamento.");
    attachStripeSession(order.id, session.id);
    return { orderId: order.id, url: session.url };
  } catch (error) {
    markOrderCheckoutFailed(order.id);
    throw error;
  }
}

export async function syncStripeSession(sessionId: string): Promise<StoreOrder | undefined> {
  if (!stripeIsConfigured()) return undefined;
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
    return markOrderPaid({ sessionId: session.id, ...sessionCustomer(session) });
  }
  return session.client_reference_id ? getOrder(session.client_reference_id) : undefined;
}

export function constructStripeEvent(payload: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("Webhook da Stripe não configurado.");
  return getStripe().webhooks.constructEvent(payload, signature, secret);
}

export function processStripeEvent(event: Stripe.Event) {
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid" || event.type === "checkout.session.async_payment_succeeded") {
      return markOrderPaid({ sessionId: session.id, ...sessionCustomer(session) });
    }
  }

  if (
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "checkout.session.expired"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    markOrderPaymentFailed(session.id);
  }

  return undefined;
}
