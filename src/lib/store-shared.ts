export const storeSizes = ["PP", "P", "M", "G", "GG"] as const;
export type StoreSize = (typeof storeSizes)[number];

export const orderStatuses = [
  "pedido_feito",
  "pagamento_aprovado",
  "pronto_para_enviar",
  "enviado",
  "cancelado"
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  pedido_feito: "Pedido feito",
  pagamento_aprovado: "Pagamento aprovado",
  pronto_para_enviar: "Pronto para enviar",
  enviado: "Enviado",
  cancelado: "Cancelado"
};

export const STORE_SHIPPING_CENTS = 1990;

export type StoreProduct = {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  image_url: string | null;
  active: number;
  inventory: Record<StoreSize, number>;
  created_at: string;
  updated_at: string;
};

export type StoreOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  title: string;
  size: StoreSize;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
};

export type StoreOrder = {
  id: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address_json: string | null;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  order_status: OrderStatus;
  payment_status: string;
  created_at: string;
  updated_at: string;
  items: StoreOrderItem[];
};

export type CartInput = {
  productId: string;
  size: string;
  quantity: number;
};
