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
export const pickupCities = ["Americana", "Campinas", "Itatiba", "Mogi Mirim", "Recife"] as const;
export type PickupCity = (typeof pickupCities)[number];
export type FulfillmentMethod = "shipping" | "athlete_pickup";
export type StorePaymentMethod = "stripe" | "pix";
export const storeVariantDefinitions = [
  { code: "casual", label: "Casual" },
  { code: "dri_fit", label: "Dri-fit" }
] as const;
export type StoreVariantCode = (typeof storeVariantDefinitions)[number]["code"];
export type StoreVariantLabel = (typeof storeVariantDefinitions)[number]["label"];

export type StoreProductVariant = {
  code: StoreVariantCode;
  label: StoreVariantLabel;
  price_cents: number;
  active: number;
  inventory: Record<StoreSize, number>;
};

export type StoreProduct = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  design_image_url: string | null;
  active: number;
  variants: StoreProductVariant[];
  created_at: string;
  updated_at: string;
};

export type StoreOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  title: string;
  variant_code: StoreVariantCode;
  variant_label: StoreVariantLabel;
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
  fulfillment_method: FulfillmentMethod;
  pickup_city: PickupCity | null;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  order_status: OrderStatus;
  payment_status: string;
  payment_method: StorePaymentMethod;
  pix_reference: string | null;
  pix_payload: string | null;
  created_at: string;
  updated_at: string;
  items: StoreOrderItem[];
};

export type CartInput = {
  productId: string;
  variant: string;
  size: string;
  quantity: number;
};
