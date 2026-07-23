"use client";

import Image from "next/image";
import { MapPin, Minus, Package, Plus, ShieldCheck, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  pickupCities,
  STORE_SHIPPING_CENTS,
  storeSizes,
  type FulfillmentMethod,
  type PickupCity,
  type StoreProduct,
  type StoreSize
} from "@/lib/store-shared";
import styles from "@/app/apoie-o-projeto/store.module.css";

type CartItem = {
  productId: string;
  title: string;
  imageUrl: string | null;
  priceCents: number;
  size: StoreSize;
  quantity: number;
  stock: number;
};

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

function availableSizes(product: StoreProduct) {
  return storeSizes.filter((size) => product.inventory[size] > 0);
}

export function Storefront({
  initialProducts,
  checkoutCancelled
}: {
  initialProducts: StoreProduct[];
  checkoutCancelled: boolean;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, StoreSize>>(() =>
    Object.fromEntries(
      initialProducts.map((product) => [product.id, availableSizes(product)[0] ?? "M"])
    ) as Record<string, StoreSize>
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("shipping");
  const [pickupCity, setPickupCity] = useState<PickupCity>("Americana");

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.priceCents * item.quantity, 0),
    [cart]
  );
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const shippingCents = cart.length && fulfillmentMethod === "shipping" ? STORE_SHIPPING_CENTS : 0;

  function addToCart(product: StoreProduct) {
    const size = selectedSizes[product.id] ?? availableSizes(product)[0];
    const quantity = Math.max(1, Math.min(10, quantities[product.id] ?? 1));
    if (!size || product.inventory[size] < quantity) {
      setError("Escolha um tamanho disponível.");
      return;
    }
    setError("");
    setCart((current) => {
      const index = current.findIndex((item) => item.productId === product.id && item.size === size);
      if (index >= 0) {
        return current.map((item, itemIndex) =>
          itemIndex === index
            ? { ...item, quantity: Math.min(item.stock, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          title: product.title,
          imageUrl: product.image_url,
          priceCents: product.price_cents,
          size,
          quantity,
          stock: product.inventory[size]
        }
      ];
    });
    setDrawerOpen(true);
  }

  function changeCartQuantity(index: number, delta: number) {
    setCart((current) =>
      current
        .map((item, itemIndex) =>
          itemIndex === index
            ? { ...item, quantity: Math.max(0, Math.min(item.stock, item.quantity + delta)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  async function checkout() {
    if (!cart.length) return;
    setCheckoutLoading(true);
    setError("");
    try {
      const response = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillmentMethod,
          pickupCity: fulfillmentMethod === "athlete_pickup" ? pickupCity : undefined,
          items: cart.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity
          }))
        })
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error ?? "Não foi possível abrir o checkout.");
      window.location.assign(result.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Não foi possível abrir o checkout.");
      setCheckoutLoading(false);
    }
  }

  return (
    <main className={styles.storePage}>
      <section className={styles.storeHero}>
        <div>
          <span className="eyebrow">Loja oficial 11RUN</span>
          <h1>Vista o movimento.<br />Fortaleça o atletismo.</h1>
          <p>
            Produtos oficiais criados para quem acredita que correr transforma trajetórias. Cada compra ajuda a
            sustentar o ecossistema 11RUN.
          </p>
        </div>
        <div className={styles.heroBenefits}>
          <article><ShieldCheck /><span><strong>Pagamento seguro</strong>Checkout protegido pela Stripe</span></article>
          <article><Truck /><span><strong>Entrega ou retirada</strong>Frete fixo ou retirada gratuita com atletas</span></article>
          <article><Package /><span><strong>Estoque por tamanho</strong>PP, P, M, G e GG</span></article>
        </div>
      </section>

      {checkoutCancelled ? (
        <div className={styles.notice}>O pagamento foi cancelado. Seus produtos continuam disponíveis para uma nova tentativa.</div>
      ) : null}

      <section className={styles.catalog} aria-labelledby="catalog-title">
        <header className={styles.catalogHeader}>
          <div>
            <span className="eyebrow">Coleção 11RUN</span>
            <h2 id="catalog-title">Produtos que carregam propósito.</h2>
          </div>
          <button className={styles.cartButton} type="button" onClick={() => setDrawerOpen(true)}>
            <ShoppingBag size={18} />
            Carrinho
            <span>{cartCount}</span>
          </button>
        </header>

        <div className={styles.productGrid}>
          {initialProducts.map((product) => {
            const sizes = availableSizes(product);
            const selected = selectedSizes[product.id] ?? sizes[0];
            const quantity = quantities[product.id] ?? 1;
            return (
              <article className={styles.productCard} key={product.id}>
                <div className={styles.productImage}>
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.title} fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized={product.image_url.startsWith("/api/")} />
                  ) : (
                    <span>Foto em breve</span>
                  )}
                </div>
                <div className={styles.productDetails}>
                  <span className={styles.productTag}>Camiseta oficial</span>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                  <strong className={styles.price}>{currency(product.price_cents)}</strong>

                  <fieldset className={styles.sizeSelector}>
                    <legend>Tamanho</legend>
                    <div>
                      {storeSizes.map((size) => (
                        <button
                          className={selected === size ? styles.sizeActive : ""}
                          type="button"
                          key={size}
                          disabled={!sizes.includes(size)}
                          onClick={() => setSelectedSizes((current) => ({ ...current, [product.id]: size }))}
                          aria-pressed={selected === size}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className={styles.purchaseRow}>
                    <div className={styles.quantityControl} aria-label="Quantidade">
                      <button type="button" onClick={() => setQuantities((current) => ({ ...current, [product.id]: Math.max(1, quantity - 1) }))}><Minus size={15} /></button>
                      <span>{quantity}</span>
                      <button type="button" onClick={() => setQuantities((current) => ({ ...current, [product.id]: Math.min(10, quantity + 1) }))}><Plus size={15} /></button>
                    </div>
                    <button className={styles.primaryButton} type="button" onClick={() => addToCart(product)} disabled={!sizes.length}>
                      <ShoppingBag size={17} />
                      {sizes.length ? "Adicionar ao carrinho" : "Produto esgotado"}
                    </button>
                  </div>
                  <small>Frete fixo de {currency(STORE_SHIPPING_CENTS)} ou retirada gratuita com atletas.</small>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {drawerOpen ? <button className={styles.backdrop} type="button" aria-label="Fechar carrinho" onClick={() => setDrawerOpen(false)} /> : null}
      <aside className={`${styles.cartDrawer} ${drawerOpen ? styles.cartDrawerOpen : ""}`} aria-hidden={!drawerOpen}>
        <header>
          <div><span className="eyebrow">Seu pedido</span><h2>Carrinho</h2></div>
          <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Fechar carrinho"><X /></button>
        </header>

        <div className={styles.cartItems}>
          {!cart.length ? (
            <div className={styles.emptyCart}><ShoppingBag /><strong>Seu carrinho está vazio.</strong><span>Escolha um produto para começar.</span></div>
          ) : cart.map((item, index) => (
            <article className={styles.cartItem} key={`${item.productId}-${item.size}`}>
              <div className={styles.cartThumb}>
                {item.imageUrl ? <Image src={item.imageUrl} alt="" fill sizes="72px" unoptimized={item.imageUrl.startsWith("/api/")} /> : null}
              </div>
              <div>
                <strong>{item.title}</strong>
                <span>Tamanho {item.size}</span>
                <div className={styles.cartQuantity}>
                  <button type="button" onClick={() => changeCartQuantity(index, -1)}><Minus size={13} /></button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => changeCartQuantity(index, 1)}><Plus size={13} /></button>
                  <button type="button" onClick={() => setCart((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remover item"><Trash2 size={14} /></button>
                </div>
              </div>
              <strong>{currency(item.priceCents * item.quantity)}</strong>
            </article>
          ))}
        </div>

        <footer>
          <fieldset className={styles.fulfillment}>
            <legend>Como deseja receber?</legend>
            <div className={styles.fulfillmentOptions}>
              <button
                className={fulfillmentMethod === "shipping" ? styles.fulfillmentActive : ""}
                type="button"
                onClick={() => setFulfillmentMethod("shipping")}
                aria-pressed={fulfillmentMethod === "shipping"}
              >
                <Truck size={17} />
                <span><strong>Entrega</strong><small>Frete fixo de {currency(STORE_SHIPPING_CENTS)}</small></span>
              </button>
              <button
                className={fulfillmentMethod === "athlete_pickup" ? styles.fulfillmentActive : ""}
                type="button"
                onClick={() => setFulfillmentMethod("athlete_pickup")}
                aria-pressed={fulfillmentMethod === "athlete_pickup"}
              >
                <MapPin size={17} />
                <span><strong>Retirar com atletas</strong><small>Grátis</small></span>
              </button>
            </div>
            {fulfillmentMethod === "athlete_pickup" ? (
              <label className={styles.pickupCity}>
                <span>Cidade para retirada</span>
                <select value={pickupCity} onChange={(event) => setPickupCity(event.target.value as PickupCity)}>
                  {pickupCities.map((city) => <option value={city} key={city}>{city}</option>)}
                </select>
              </label>
            ) : null}
          </fieldset>
          <div><span>Subtotal</span><strong>{currency(subtotal)}</strong></div>
          <div>
            <span>{fulfillmentMethod === "athlete_pickup" ? `Retirada · ${pickupCity}` : "Frete padrão"}</span>
            <strong>{shippingCents ? currency(shippingCents) : "Grátis"}</strong>
          </div>
          <div className={styles.cartTotal}><span>Total</span><strong>{currency(subtotal + shippingCents)}</strong></div>
          {error ? <p className={styles.cartError}>{error}</p> : null}
          <button className={styles.checkoutButton} type="button" disabled={!cart.length || checkoutLoading} onClick={checkout}>
            <ShieldCheck size={18} />
            {checkoutLoading ? "Abrindo pagamento..." : "Ir para pagamento seguro"}
          </button>
          <small>Você será direcionado ao ambiente seguro da Stripe para escolher a forma de pagamento disponível.</small>
        </footer>
      </aside>
    </main>
  );
}
