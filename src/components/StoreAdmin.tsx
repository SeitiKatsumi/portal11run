"use client";

import Image from "next/image";
import { Boxes, CheckCircle2, PackageCheck, PencilLine, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  orderStatusLabels,
  orderStatuses,
  storeSizes,
  type OrderStatus,
  type StoreOrder,
  type StoreProduct
} from "@/lib/store-shared";
import styles from "@/app/admin/loja/store-admin.module.css";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

function dateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function shippingAddress(value: string | null) {
  if (!value) return null;
  try {
    const address = JSON.parse(value);
    return address && typeof address === "object" ? address as Record<string, string> : null;
  } catch {
    return null;
  }
}

const stageIcons = {
  pedido_feito: ShoppingBag,
  pagamento_aprovado: CheckCircle2,
  pronto_para_enviar: PackageCheck,
  enviado: Truck,
  cancelado: X
};

export function StoreAdmin({
  initialProducts,
  initialOrders
}: {
  initialProducts: StoreProduct[];
  initialOrders: StoreOrder[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [editing, setEditing] = useState<StoreProduct | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "products">("products");
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadOrders() {
      try {
        const response = await fetch("/api/admin/store/orders", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Erro ao carregar pedidos.");
        if (active) setOrders(Array.isArray(result.orders) ? result.orders : []);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? `Não foi possível carregar os pedidos: ${loadError.message}`
              : "Não foi possível carregar os pedidos."
          );
        }
      } finally {
        if (active) setOrdersLoading(false);
      }
    }
    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => ({
    orders: orders.length,
    paid: orders.filter((order) => order.payment_status === "pago").length,
    ready: orders.filter((order) => order.order_status === "pronto_para_enviar").length,
    shipped: orders.filter((order) => order.order_status === "enviado").length
  }), [orders]);

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    if (editing) form.set("id", editing.id);
    const response = await fetch("/api/admin/store/products", {
      method: editing ? "PATCH" : "POST",
      body: form
    });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "Erro ao salvar produto.");
      return;
    }
    setProducts((current) =>
      editing
        ? current.map((product) => product.id === result.product.id ? result.product : product)
        : [result.product, ...current]
    );
    setEditing(null);
    event.currentTarget.reset();
  }

  async function deactivate(id: string) {
    const response = await fetch(`/api/admin/store/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) {
      setProducts((current) => current.map((product) => product.id === id ? { ...product, active: 0 } : product));
    }
  }

  async function setOrderStatus(id: string, status: OrderStatus) {
    const response = await fetch("/api/admin/store/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Erro ao atualizar pedido.");
      return;
    }
    setOrders((current) => current.map((order) => order.id === id ? result.order : order));
  }

  return (
    <section className={styles.adminStore}>
      <header className={styles.heading}>
        <div>
          <span className="eyebrow">Loja 11RUN</span>
          <h1>Pedidos e produtos</h1>
          <p>Acompanhe pagamentos, preparação de envios e o estoque por tamanho.</p>
        </div>
        <div className={styles.tabs}>
          <button className={activeTab === "orders" ? styles.activeTab : ""} type="button" onClick={() => setActiveTab("orders")}>
            <ShoppingBag size={16} /> Pedidos
          </button>
          <button className={activeTab === "products" ? styles.activeTab : ""} type="button" onClick={() => setActiveTab("products")}>
            <Boxes size={16} /> Produtos
          </button>
        </div>
      </header>

      <div className={styles.metrics}>
        <article><span>Pedidos feitos</span><strong>{metrics.orders}</strong><ShoppingBag /></article>
        <article><span>Pagamentos aprovados</span><strong>{metrics.paid}</strong><CheckCircle2 /></article>
        <article><span>Prontos para enviar</span><strong>{metrics.ready}</strong><PackageCheck /></article>
        <article><span>Enviados</span><strong>{metrics.shipped}</strong><Truck /></article>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      {activeTab === "orders" ? (
        <div className={styles.orders}>
          <div className={styles.sectionHeading}>
            <div><span className="eyebrow">Operação</span><h2>Fluxo dos pedidos</h2></div>
            <span>{orders.length} registro{orders.length === 1 ? "" : "s"}</span>
          </div>
          {ordersLoading ? (
            <div className={styles.empty}><ShoppingBag /><strong>Carregando pedidos...</strong><span>Aguarde enquanto consultamos a operação da loja.</span></div>
          ) : !orders.length ? (
            <div className={styles.empty}><ShoppingBag /><strong>Nenhum pedido recebido ainda.</strong><span>Os novos pedidos aparecerão aqui automaticamente.</span></div>
          ) : (
            <div className={styles.orderList}>
              {orders.map((order) => {
                const StageIcon = stageIcons[order.order_status] ?? ShoppingBag;
                const address = shippingAddress(order.shipping_address_json);
                return (
                  <article className={styles.orderCard} key={order.id}>
                    <div className={styles.orderTop}>
                      <div className={styles.orderIdentity}>
                        <span className={styles.stageIcon}><StageIcon size={18} /></span>
                        <div>
                          <span>Pedido #{order.id.slice(0, 8).toUpperCase()}</span>
                          <strong>{order.customer_name || "Cliente aguardando checkout"}</strong>
                          <small>{dateTime(order.created_at)}</small>
                        </div>
                      </div>
                      <div className={styles.orderStatus}>
                        <span className={order.payment_status === "pago" ? styles.paid : styles.unpaid}>
                          {order.payment_status === "pago" ? "Pagamento aprovado" : "Aguardando pagamento"}
                        </span>
                        <select value={order.order_status} onChange={(event) => setOrderStatus(order.id, event.target.value as OrderStatus)}>
                          {orderStatuses.map((status) => <option value={status} key={status}>{orderStatusLabels[status]}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className={styles.orderBody}>
                      <div>
                        <span>Itens</span>
                        {order.items.map((item) => (
                          <p key={item.id}><strong>{item.quantity}×</strong> {item.title} · {item.size}</p>
                        ))}
                      </div>
                      <div>
                        <span>Contato</span>
                        <p>{order.customer_email || "E-mail não informado"}</p>
                        <p>{order.customer_phone || "Telefone não informado"}</p>
                      </div>
                      <div>
                        <span>Entrega</span>
                        {address ? (
                          <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city} · {address.state}<br />{address.postal_code}</p>
                        ) : <p>Endereço aguardando checkout</p>}
                      </div>
                      <div className={styles.orderTotal}>
                        <span>Total</span>
                        <strong>{currency(order.total_cents)}</strong>
                        <small>Frete {currency(order.shipping_cents)}</small>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.productsArea}>
          <form className={styles.productForm} onSubmit={saveProduct} key={editing?.id ?? "new"}>
            <div className={styles.sectionHeading}>
              <div><span className="eyebrow">Catálogo</span><h2>{editing ? "Editar produto" : "Novo produto"}</h2></div>
              {editing ? <button type="button" onClick={() => setEditing(null)}><X size={16} /> Cancelar</button> : null}
            </div>
            <div className={styles.formGrid}>
              <label><span>Título</span><input name="title" required defaultValue={editing?.title ?? ""} placeholder='Camiseta "Além da Imaginação"' /></label>
              <label><span>Preço</span><input name="price" required defaultValue={editing ? currency(editing.price_cents).replace("R$", "").trim() : ""} placeholder="59,90" /></label>
              <label className={styles.full}><span>Descrição</span><textarea name="description" rows={3} defaultValue={editing?.description ?? ""} placeholder="Descrição curta do produto." /></label>
              <label className={styles.full}><span>Foto do produto</span><input name="image" type="file" accept="image/*" /></label>
              <fieldset className={styles.stockFields}>
                <legend>Quantidade em estoque por tamanho</legend>
                {storeSizes.map((size) => (
                  <label key={size}><span>{size}</span><input name={`stock_${size}`} type="number" min="0" defaultValue={editing?.inventory[size] ?? 0} /></label>
                ))}
              </fieldset>
              <label className={styles.activeCheck}><input name="active" type="checkbox" defaultChecked={editing ? editing.active === 1 : true} /><span>Produto visível na loja</span></label>
            </div>
            <button className={styles.saveButton} type="submit" disabled={loading}><Plus size={17} />{loading ? "Salvando..." : editing ? "Atualizar produto" : "Cadastrar produto"}</button>
          </form>

          <div className={styles.productList}>
            {products.map((product) => (
              <article className={`${styles.adminProductCard} ${product.active ? "" : styles.inactive}`} key={product.id}>
                <div className={styles.adminProductImage}>
                  {product.image_url ? <Image src={product.image_url} alt={product.title} fill sizes="180px" unoptimized={product.image_url.startsWith("/api/")} /> : null}
                </div>
                <div>
                  <span>{product.active ? "Publicado" : "Oculto"}</span>
                  <h3>{product.title}</h3>
                  <strong>{currency(product.price_cents)}</strong>
                  <div className={styles.inventoryPills}>{storeSizes.map((size) => <small key={size}>{size} · {product.inventory[size]}</small>)}</div>
                </div>
                <div className={styles.productActions}>
                  <button type="button" onClick={() => setEditing(product)} aria-label={`Editar ${product.title}`}><PencilLine size={16} /></button>
                  <button type="button" onClick={() => deactivate(product.id)} aria-label={`Ocultar ${product.title}`}><Trash2 size={16} /></button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
