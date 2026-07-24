import { mkdirSync, readFileSync } from "fs";
import { randomUUID } from "node:crypto";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import {
  orderStatuses,
  pickupCities,
  STORE_SHIPPING_CENTS,
  storeVariantDefinitions,
  storeSizes,
  type CartInput,
  type FulfillmentMethod,
  type OrderStatus,
  type PickupCity,
  type StoreOrder,
  type StoreOrderItem,
  type StorePaymentMethod,
  type StoreProduct,
  type StoreProductVariant,
  type StoreVariantCode,
  type StoreSize
} from "@/lib/store-shared";

export * from "@/lib/store-shared";

type ProductInput = {
  title: string;
  description?: string;
  image_url?: string;
  design_image_url?: string;
  active?: boolean;
  variants: Record<
    StoreVariantCode,
    {
      price_cents: number;
      active?: boolean;
      inventory?: Partial<Record<StoreSize, number>>;
    }
  >;
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
  ensureColumn(database, "store_order_items", "variant_code", "TEXT NOT NULL DEFAULT 'casual'");
  ensureColumn(database, "store_order_items", "variant_label", "TEXT NOT NULL DEFAULT 'Casual'");
  ensureColumn(database, "store_orders", "payment_method", "TEXT NOT NULL DEFAULT 'stripe'");
  ensureColumn(database, "store_orders", "pix_reference", "TEXT");
  ensureColumn(database, "store_orders", "pix_payload", "TEXT");
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
  const legacyIds = designs.flatMap(([slug]) => [
    `camiseta-${slug}-passeio`,
    `camiseta-${slug}-dri-fit`
  ]);
  const deactivateLegacy = db.prepare("UPDATE store_products SET active = 0, updated_at = ? WHERE id = ?");
  const removeLegacy = db.prepare(
    `DELETE FROM store_products
     WHERE id = ?
       AND NOT EXISTS (SELECT 1 FROM store_order_items WHERE product_id = store_products.id)`
  );
  for (const legacyId of legacyIds) {
    deactivateLegacy.run(timestamp, legacyId);
    removeLegacy.run(legacyId);
  }

  const insertProduct = db.prepare(
    `INSERT OR IGNORE INTO store_products (
      id, title, description, product_type, price_cents, image_url, design_image_url, active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  );
  const publishProduct = db.prepare(
    `UPDATE store_products
     SET title = ?, description = ?, image_url = ?, design_image_url = ?, active = 1, updated_at = ?
     WHERE id = ?`
  );
  const insertVariant = db.prepare(
    `INSERT INTO store_product_variants (
      product_id, variant_code, variant_label, price_cents, active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 1, ?, ?)
    ON CONFLICT(product_id, variant_code) DO UPDATE SET
      variant_label = excluded.variant_label,
      price_cents = excluded.price_cents,
      active = 1,
      updated_at = excluded.updated_at`
  );
  const insertVariantInventory = db.prepare(
    `INSERT OR IGNORE INTO store_variant_inventory (product_id, variant_code, size, quantity)
     VALUES (?, ?, ?, ?)`
  );

  for (const [slug, designName, imageNumber] of designs) {
    const id = `camiseta-${slug}`;
    const title = `Camiseta "${designName}"`;
    const description = "Camiseta branca com estampa oficial 11RUN. Escolha entre tecido Casual ou Dri-fit.";
    const imageUrl = `/assets/store/colecao-sonho-olimpico/camiseta-${imageNumber}.webp`;
    const designImageUrl = `/assets/store/colecao-sonho-olimpico/estampa-${imageNumber}.webp`;
    insertProduct.run(
      id,
      title,
      description,
      "Casual",
      5990,
      imageUrl,
      designImageUrl,
      timestamp,
      timestamp
    );
    publishProduct.run(title, description, imageUrl, designImageUrl, timestamp, id);

    for (const definition of storeVariantDefinitions) {
      const priceCents = definition.code === "casual" ? 5990 : 7990;
      insertVariant.run(id, definition.code, definition.label, priceCents, timestamp, timestamp);
      for (const size of storeSizes) insertVariantInventory.run(id, definition.code, size, 20);
    }
  }
}

function inventoryFor(productId: string, variantCode: StoreVariantCode) {
  const inventory = Object.fromEntries(storeSizes.map((size) => [size, 0])) as Record<StoreSize, number>;
  const rows = getDatabase()
    .prepare(
      "SELECT size, quantity FROM store_variant_inventory WHERE product_id = ? AND variant_code = ?"
    )
    .all(productId, variantCode) as Array<{ size: StoreSize; quantity: number }>;
  for (const row of rows) {
    if (storeSizes.includes(row.size)) inventory[row.size] = normalizeStock(row.quantity);
  }
  return inventory;
}

function variantsFor(productId: string) {
  const rows = getDatabase()
    .prepare(
      `SELECT variant_code AS code, variant_label AS label, price_cents, active
       FROM store_product_variants
       WHERE product_id = ?
       ORDER BY CASE variant_code WHEN 'casual' THEN 0 ELSE 1 END`
    )
    .all(productId) as Array<Omit<StoreProductVariant, "inventory">>;
  return rows.map((variant) => ({
    ...variant,
    inventory: inventoryFor(productId, variant.code)
  }));
}

function hydrateProduct(row: Omit<StoreProduct, "variants">): StoreProduct {
  return { ...row, variants: variantsFor(row.id) };
}

export function listProducts({ activeOnly = true } = {}) {
  const rows = getDatabase()
    .prepare(
      `SELECT id, title, description, image_url, design_image_url, active, created_at, updated_at
       FROM store_products
       WHERE id <> 'camiseta-alem-da-imaginacao'
       AND id NOT LIKE 'camiseta-%-passeio'
       AND id NOT LIKE 'camiseta-%-dri-fit'
       ${activeOnly ? "AND active = 1" : ""}
       ORDER BY created_at DESC`
    )
    .all() as Array<Omit<StoreProduct, "variants">>;
  return rows.map(hydrateProduct);
}

export function getProduct(id: string) {
  const row = getDatabase()
    .prepare(
      `SELECT id, title, description, image_url, design_image_url, active, created_at, updated_at
       FROM store_products WHERE id = ?`
    )
    .get(id) as Omit<StoreProduct, "variants"> | undefined;
  return row ? hydrateProduct(row) : undefined;
}

function validateProduct(input: ProductInput) {
  const title = input.title.trim();
  const description = input.description?.trim() ?? "";
  if (!title) throw new Error("O título do produto é obrigatório.");
  const variants = Object.fromEntries(
    storeVariantDefinitions.map((definition) => {
      const variant = input.variants?.[definition.code];
      const priceCents = Math.trunc(Number(variant?.price_cents));
      if (!Number.isFinite(priceCents) || priceCents <= 0) {
        throw new Error(`Informe um preço válido para ${definition.label}.`);
      }
      return [
        definition.code,
        {
          price_cents: priceCents,
          active: variant?.active !== false,
          inventory: variant?.inventory
        }
      ];
    })
  ) as ProductInput["variants"];
  return { title, description, variants };
}

function upsertVariants(db: DatabaseSync, productId: string, variants: ProductInput["variants"]) {
  const timestamp = now();
  const variantStatement = db.prepare(
    `INSERT INTO store_product_variants (
      product_id, variant_code, variant_label, price_cents, active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(product_id, variant_code) DO UPDATE SET
      variant_label = excluded.variant_label,
      price_cents = excluded.price_cents,
      active = excluded.active,
      updated_at = excluded.updated_at`
  );
  const statement = db.prepare(
    `INSERT INTO store_variant_inventory (product_id, variant_code, size, quantity)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(product_id, variant_code, size) DO UPDATE SET quantity = excluded.quantity`
  );
  for (const definition of storeVariantDefinitions) {
    const variant = variants[definition.code];
    variantStatement.run(
      productId,
      definition.code,
      definition.label,
      variant.price_cents,
      variant.active === false ? 0 : 1,
      timestamp,
      timestamp
    );
    for (const size of storeSizes) {
      statement.run(productId, definition.code, size, normalizeStock(variant.inventory?.[size]));
    }
  }
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
      "Casual",
      values.variants.casual.price_cents,
      input.image_url?.trim() || null,
      input.design_image_url?.trim() || null,
      input.active === false ? 0 : 1,
      timestamp,
      timestamp
    );
    upsertVariants(db, productId, values.variants);
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
       SET title = ?, description = ?, product_type = 'Casual', price_cents = ?, image_url = ?, design_image_url = ?, active = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      values.title,
      values.description,
      values.variants.casual.price_cents,
      input.image_url === undefined ? current.image_url : input.image_url?.trim() || null,
      input.design_image_url === undefined
        ? current.design_image_url
        : input.design_image_url?.trim() || null,
      input.active === false ? 0 : 1,
      now(),
      id
    );
    upsertVariants(db, id, values.variants);
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
  fulfillment: { method: FulfillmentMethod; pickupCity?: string | null } = { method: "shipping" },
  paymentMethod: StorePaymentMethod = "stripe"
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
    const variant = item.variant as StoreVariantCode;
    const quantity = Math.max(1, Math.min(10, Math.trunc(Number(item.quantity))));
    if (!storeSizes.includes(size)) throw new Error("Tamanho inválido.");
    if (!storeVariantDefinitions.some((definition) => definition.code === variant)) {
      throw new Error("Variação de tecido inválida.");
    }
    normalized.set(`${item.productId}:${variant}:${size}`, {
      productId: item.productId,
      variant,
      size,
      quantity
    });
  }

  const items = [...normalized.values()].map((item) => {
    const product = getProduct(item.productId);
    if (!product || product.active !== 1) throw new Error("Um produto do carrinho não está disponível.");
    const variant = product.variants.find((candidate) => candidate.code === item.variant && candidate.active === 1);
    if (!variant) throw new Error(`A variação escolhida para ${product.title} não está disponível.`);
    const available = variant.inventory[item.size as StoreSize] ?? 0;
    if (available < item.quantity) throw new Error(`Estoque insuficiente para ${product.title} — ${item.size}.`);
    return {
      product,
      variant,
      size: item.size as StoreSize,
      quantity: item.quantity,
      lineTotal: variant.price_cents * item.quantity
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
        order_status, payment_status, payment_method, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pedido_feito', 'não pago', ?, ?, ?)`
    ).run(
      orderId,
      fulfillment.method,
      pickupCity,
      subtotal,
      shippingCents,
      total,
      paymentMethod,
      timestamp,
      timestamp
    );
    const insertItem = db.prepare(
      `INSERT INTO store_order_items (
        id, order_id, product_id, title, variant_code, variant_label, size,
        unit_price_cents, quantity, line_total_cents
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const item of items) {
      insertItem.run(
        randomUUID(),
        orderId,
        item.product.id,
        item.product.title,
        item.variant.code,
        item.variant.label,
        item.size,
        item.variant.price_cents,
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
      `SELECT id, order_id, product_id, title, variant_code, variant_label, size,
              unit_price_cents, quantity, line_total_cents
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

export function attachPixPayment(orderId: string, reference: string, payload: string) {
  getDatabase()
    .prepare(
      `UPDATE store_orders
       SET payment_method = 'pix', pix_reference = ?, pix_payload = ?, updated_at = ?
       WHERE id = ?`
    )
    .run(reference, payload, now(), orderId);
  return getOrder(orderId);
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
        `UPDATE store_variant_inventory
         SET quantity = MAX(0, quantity - ?)
         WHERE product_id = ? AND variant_code = ? AND size = ?`
      );
      for (const item of order.items) {
        decrement.run(item.quantity, item.product_id, item.variant_code, item.size);
      }
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
