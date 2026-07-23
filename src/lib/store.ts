import { mkdirSync, readFileSync } from "fs";
import { randomUUID } from "node:crypto";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import {
  orderStatuses,
  pickupCities,
  STORE_SHIPPING_CENTS,
  storeProductTypes,
  storeSizes,
  type CartInput,
  type FulfillmentMethod,
  type OrderStatus,
  type PickupCity,
  type StoreOrder,
  type StoreOrderItem,
  type StoreProduct,
  type StoreProductType,
  type StoreSize
} from "@/lib/store-shared";

export * from "@/lib/store-shared";

type ProductInput = {
  title: string;
  description?: string;
  product_type?: StoreProductType;
  price_cents: number;
  image_url?: string;
  design_image_url?: string;
  active?: boolean;
  inventory?: Partial<Record<StoreSize, number>>;
};

let database: DatabaseSync | undefined;

function now() {
  return new Date().toISOString();
}

function normalizeStock(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
}

function getDatabase() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(readFileSync(path.join(process.cwd(), "data/schema.sql"), "utf8"));
  ensureColumn(database, "store_orders", "fulfillment_method", "TEXT NOT NULL DEFAULT 'shipping'");
  ensureColumn(database, "store_orders", "pickup_city", "TEXT");
  ensureColumn(database, "store_products", "product_type", "TEXT NOT NULL DEFAULT 'De passeio'");
  ensureColumn(database, "store_products", "design_image_url", "TEXT");
  database.exec("CREATE INDEX IF NOT EXISTS idx_store_products_active ON store_products(active);");
  database.exec("CREATE INDEX IF NOT EXISTS idx_store_orders_status ON store_orders(order_status);");
  database.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_store_orders_session ON store_orders(stripe_session_id);");
  seedDefaultProduct(database);
  return database;
}

function ensureColumn(db: DatabaseSync, table: string, column: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function seedDefaultProduct(db: DatabaseSync) {
  const timestamp = now();
  db.prepare("UPDATE store_products SET active = 0, updated_at = ? WHERE id = ?")
    .run(timestamp, "camiseta-alem-da-imaginacao");

  const designs = [
    ["centro-sonho-olimpico", "Centro do Sonho Olímpico", 1],
    ["onzerun-horizontal", "OnzeRun Horizontal", 2],
    ["futuro-olimpico-comeca-aqui", "O Futuro Olímpico Começa Aqui", 3],
    ["apoio-sonho-olimpico", "Eu Apoio o Sonho Olímpico", 4],
    ["faco-parte-sonho-olimpico", "Eu Faço Parte do Sonho Olímpico", 5]
  ] as const;
  const productTypes = [
    ["passeio", "De passeio", "poliéster branco", 5990],
    ["dri-fit", "Dri-fit", "tecido Dri-fit branco", 7990]
  ] as const;
  const insertProduct = db.prepare(
    `INSERT OR IGNORE INTO store_products (
      id, title, description, product_type, price_cents, image_url, design_image_url, active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  );

  const insertInventory = db.prepare(
    "INSERT OR IGNORE INTO store_inventory (product_id, size, quantity) VALUES (?, ?, ?)"
  );
  for (const [slug, designName, imageNumber] of designs) {
    for (const [typeSlug, productType, material, priceCents] of productTypes) {
      const id = `camiseta-${slug}-${typeSlug}`;
      insertProduct.run(
        id,
        `Camiseta ${productType.toLowerCase()} "${designName}"`,
        `Camiseta branca em ${material} com estampa oficial 11RUN.`,
        productType,
        priceCents,
        `/assets/store/colecao-sonho-olimpico/camiseta-${imageNumber}.webp`,
        `/assets/store/colecao-sonho-olimpico/estampa-${imageNumber}.webp`,
        timestamp,
        timestamp
      );
      for (const size of storeSizes) insertInventory.run(id, size, 20);
    }
  }
}

function inventoryFor(productId: string) {
  const inventory = Object.fromEntries(storeSizes.map((size) => [size, 0])) as Record<StoreSize, number>;
  const rows = getDatabase()
    .prepare("SELECT size, quantity FROM store_inventory WHERE product_id = ?")
    .all(productId) as Array<{ size: StoreSize; quantity: number }>;
  for (const row of rows) {
    if (storeSizes.includes(row.size)) inventory[row.size] = normalizeStock(row.quantity);
  }
  return inventory;
}

function hydrateProduct(row: Omit<StoreProduct, "inventory">): StoreProduct {
  return { ...row, inventory: inventoryFor(row.id) };
}

export function listProducts({ activeOnly = true } = {}) {
  const rows = getDatabase()
    .prepare(
      `SELECT id, title, description, product_type, price_cents, image_url, design_image_url, active, created_at, updated_at
       FROM store_products
       WHERE id <> 'camiseta-alem-da-imaginacao'
       ${activeOnly ? "AND active = 1" : ""}
       ORDER BY created_at DESC`
    )
    .all() as Array<Omit<StoreProduct, "inventory">>;
  return rows.map(hydrateProduct);
}

export function getProduct(id: string) {
  const row = getDatabase()
    .prepare(
      `SELECT id, title, description, product_type, price_cents, image_url, design_image_url, active, created_at, updated_at
       FROM store_products WHERE id = ?`
    )
    .get(id) as Omit<StoreProduct, "inventory"> | undefined;
  return row ? hydrateProduct(row) : undefined;
}

function validateProduct(input: ProductInput) {
  const title = input.title.trim();
  const description = input.description?.trim() ?? "";
  const productType = storeProductTypes.includes(input.product_type as StoreProductType)
    ? input.product_type as StoreProductType
    : "De passeio";
  const priceCents = Math.trunc(Number(input.price_cents));
  if (!title) throw new Error("O título do produto é obrigatório.");
  if (!Number.isFinite(priceCents) || priceCents <= 0) throw new Error("Informe um preço válido.");
  return { title, description, productType, priceCents };
}

function upsertInventory(db: DatabaseSync, productId: string, inventory?: Partial<Record<StoreSize, number>>) {
  const statement = db.prepare(
    `INSERT INTO store_inventory (product_id, size, quantity)
     VALUES (?, ?, ?)
     ON CONFLICT(product_id, size) DO UPDATE SET quantity = excluded.quantity`
  );
  for (const size of storeSizes) statement.run(productId, size, normalizeStock(inventory?.[size]));
}

export function createProduct(input: ProductInput) {
  const values = validateProduct(input);
  const db = getDatabase();
  const productId = randomUUID();
  const timestamp = now();
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      `INSERT INTO store_products (
        id, title, description, product_type, price_cents, image_url, design_image_url, active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      productId,
      values.title,
      values.description,
      values.productType,
      values.priceCents,
      input.image_url?.trim() || null,
      input.design_image_url?.trim() || null,
      input.active === false ? 0 : 1,
      timestamp,
      timestamp
    );
    upsertInventory(db, productId, input.inventory);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  return getProduct(productId)!;
}

export function updateProduct(id: string, input: ProductInput) {
  const current = getProduct(id);
  if (!current) throw new Error("Produto não encontrado.");
  const values = validateProduct(input);
  const db = getDatabase();
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      `UPDATE store_products
       SET title = ?, description = ?, product_type = ?, price_cents = ?, image_url = ?, design_image_url = ?, active = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      values.title,
      values.description,
      values.productType,
      values.priceCents,
      input.image_url === undefined ? current.image_url : input.image_url?.trim() || null,
      input.design_image_url === undefined
        ? current.design_image_url
        : input.design_image_url?.trim() || null,
      input.active === false ? 0 : 1,
      now(),
      id
    );
    upsertInventory(db, id, input.inventory ?? current.inventory);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  return getProduct(id)!;
}

export function deactivateProduct(id: string) {
  getDatabase().prepare("UPDATE store_products SET active = 0, updated_at = ? WHERE id = ?").run(now(), id);
}

export function createOrder(
  cart: CartInput[],
  fulfillment: { method: FulfillmentMethod; pickupCity?: string | null } = { method: "shipping" }
) {
  if (!Array.isArray(cart) || cart.length === 0) throw new Error("O carrinho está vazio.");
  if (!["shipping", "athlete_pickup"].includes(fulfillment.method)) {
    throw new Error("Forma de entrega inválida.");
  }
  const pickupCity =
    fulfillment.method === "athlete_pickup" && pickupCities.includes(fulfillment.pickupCity as PickupCity)
      ? fulfillment.pickupCity as PickupCity
      : null;
  if (fulfillment.method === "athlete_pickup" && !pickupCity) {
    throw new Error("Selecione a cidade para retirada com atletas.");
  }
  const normalized = new Map<string, CartInput>();
  for (const item of cart) {
    const size = item.size.toUpperCase() as StoreSize;
    const quantity = Math.max(1, Math.min(10, Math.trunc(Number(item.quantity))));
    if (!storeSizes.includes(size)) throw new Error("Tamanho inválido.");
    normalized.set(`${item.productId}:${size}`, { productId: item.productId, size, quantity });
  }

  const items = [...normalized.values()].map((item) => {
    const product = getProduct(item.productId);
    if (!product || product.active !== 1) throw new Error("Um produto do carrinho não está disponível.");
    const available = product.inventory[item.size as StoreSize] ?? 0;
    if (available < item.quantity) throw new Error(`Estoque insuficiente para ${product.title} — ${item.size}.`);
    return {
      product,
      size: item.size as StoreSize,
      quantity: item.quantity,
      lineTotal: product.price_cents * item.quantity
    };
  });

  const orderId = randomUUID();
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const shippingCents = fulfillment.method === "athlete_pickup" ? 0 : STORE_SHIPPING_CENTS;
  const total = subtotal + shippingCents;
  const timestamp = now();
  const db = getDatabase();
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      `INSERT INTO store_orders (
        id, fulfillment_method, pickup_city, subtotal_cents, shipping_cents, total_cents,
        order_status, payment_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pedido_feito', 'não pago', ?, ?)`
    ).run(
      orderId,
      fulfillment.method,
      pickupCity,
      subtotal,
      shippingCents,
      total,
      timestamp,
      timestamp
    );
    const insertItem = db.prepare(
      `INSERT INTO store_order_items (
        id, order_id, product_id, title, size, unit_price_cents, quantity, line_total_cents
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const item of items) {
      insertItem.run(
        randomUUID(),
        orderId,
        item.product.id,
        item.product.title,
        item.size,
        item.product.price_cents,
        item.quantity,
        item.lineTotal
      );
    }
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  return getOrder(orderId)!;
}

function orderItems(orderId: string) {
  return getDatabase()
    .prepare(
      `SELECT id, order_id, product_id, title, size, unit_price_cents, quantity, line_total_cents
       FROM store_order_items WHERE order_id = ? ORDER BY rowid ASC`
    )
    .all(orderId) as StoreOrderItem[];
}

function hydrateOrder(row: Omit<StoreOrder, "items">): StoreOrder {
  return { ...row, items: orderItems(row.id) };
}

export function getOrder(id: string) {
  const row = getDatabase().prepare("SELECT * FROM store_orders WHERE id = ?").get(id) as
    | Omit<StoreOrder, "items">
    | undefined;
  return row ? hydrateOrder(row) : undefined;
}

export function getOrderBySession(sessionId: string) {
  const row = getDatabase().prepare("SELECT * FROM store_orders WHERE stripe_session_id = ?").get(sessionId) as
    | Omit<StoreOrder, "items">
    | undefined;
  return row ? hydrateOrder(row) : undefined;
}

export function listOrders() {
  const rows = getDatabase()
    .prepare("SELECT * FROM store_orders ORDER BY created_at DESC")
    .all() as Array<Omit<StoreOrder, "items">>;
  return rows.map(hydrateOrder);
}

export function attachStripeSession(orderId: string, sessionId: string) {
  getDatabase()
    .prepare("UPDATE store_orders SET stripe_session_id = ?, updated_at = ? WHERE id = ?")
    .run(sessionId, now(), orderId);
}

type PaidOrderInput = {
  sessionId: string;
  paymentIntentId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingAddress?: unknown;
};

export function markOrderPaid(input: PaidOrderInput) {
  const order = getOrderBySession(input.sessionId);
  if (!order) return undefined;
  const db = getDatabase();
  db.exec("BEGIN IMMEDIATE;");
  try {
    const current = db.prepare("SELECT payment_status FROM store_orders WHERE id = ?").get(order.id) as
      | { payment_status: string }
      | undefined;
    if (current?.payment_status !== "pago") {
      const decrement = db.prepare(
        `UPDATE store_inventory
         SET quantity = MAX(0, quantity - ?)
         WHERE product_id = ? AND size = ?`
      );
      for (const item of order.items) decrement.run(item.quantity, item.product_id, item.size);
    }
    db.prepare(
      `UPDATE store_orders
       SET stripe_payment_intent_id = ?,
           customer_name = ?,
           customer_email = ?,
           customer_phone = ?,
           shipping_address_json = ?,
           payment_status = 'pago',
           order_status = CASE WHEN order_status = 'pedido_feito' THEN 'pagamento_aprovado' ELSE order_status END,
           updated_at = ?
       WHERE id = ?`
    ).run(
      input.paymentIntentId ?? order.stripe_payment_intent_id,
      input.customerName ?? order.customer_name,
      input.customerEmail ?? order.customer_email,
      input.customerPhone ?? order.customer_phone,
      input.shippingAddress ? JSON.stringify(input.shippingAddress) : order.shipping_address_json,
      now(),
      order.id
    );
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  return getOrder(order.id);
}

export function markOrderPaymentFailed(sessionId: string) {
  getDatabase()
    .prepare(
      `UPDATE store_orders
       SET payment_status = 'falhou', order_status = 'cancelado', updated_at = ?
       WHERE stripe_session_id = ? AND payment_status != 'pago'`
    )
    .run(now(), sessionId);
}

export function markOrderCheckoutFailed(orderId: string) {
  getDatabase()
    .prepare(
      `UPDATE store_orders
       SET payment_status = 'falhou', order_status = 'cancelado', updated_at = ?
       WHERE id = ? AND payment_status != 'pago'`
    )
    .run(now(), orderId);
}

export function updateOrderStatus(id: string, status: string) {
  if (!orderStatuses.includes(status as OrderStatus)) throw new Error("Status de pedido inválido.");
  getDatabase().prepare("UPDATE store_orders SET order_status = ?, updated_at = ? WHERE id = ?").run(status, now(), id);
  const order = getOrder(id);
  if (!order) throw new Error("Pedido não encontrado.");
  return order;
}
