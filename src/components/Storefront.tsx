"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  MapPin,
  Minus,
  Package,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  pickupCities,
  STORE_SHIPPING_CENTS,
  storeSizes,
  type FulfillmentMethod,
  type PickupCity,
  type StoreProduct,
  type StoreProductVariant,
  type StorePaymentMethod,
  type StoreSize
} from "@/lib/store-shared";
import styles from "@/app/apoie-o-projeto/store.module.css";

type CartItem = {
  productId: string;
  title: string;
  imageUrl: string | null;
  variantCode: StoreProductVariant["code"];
  variantLabel: StoreProductVariant["label"];
  priceCents: number;
  size: StoreSize;
  quantity: number;
  stock: number;
};

type PixPayment = {
  orderId: string;
  reference: string;
  amountCents: number;
  pixPayload: string;
  qrCode: string;
};

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

function availableVariants(product: StoreProduct) {
  return product.variants.filter((variant) => variant.active === 1);
}

function availableSizes(variant?: StoreProductVariant) {
  return variant ? storeSizes.filter((size) => variant.inventory[size] > 0) : [];
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
  const [selectedVariants, setSelectedVariants] = useState<Record<string, StoreProductVariant["code"]>>(() =>
    Object.fromEntries(
      initialProducts.map((product) => [product.id, availableVariants(product)[0]?.code ?? "casual"])
    ) as Record<string, StoreProductVariant["code"]>
  );
  const [selectedSizes, setSelectedSizes] = useState<Record<string, StoreSize>>(() =>
    Object.fromEntries(
      initialProducts.map((product) => [
        product.id,
        availableSizes(availableVariants(product)[0])[0] ?? "M"
      ])
    ) as Record<string, StoreSize>
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("shipping");
  const [paymentMethod, setPaymentMethod] = useState<StorePaymentMethod>("stripe");
  const [pickupCity, setPickupCity] = useState<PickupCity>("Americana");
  const [gallery, setGallery] = useState<{ product: StoreProduct; index: number } | null>(null);
  const [pixPayment, setPixPayment] = useState<PixPayment | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.priceCents * item.quantity, 0),
    [cart]
  );
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const shippingCents = cart.length && fulfillmentMethod === "shipping" ? STORE_SHIPPING_CENTS : 0;

  useEffect(() => {
    if (!gallery && !pixPayment) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setGallery(null);
        setPixPayment(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [gallery, pixPayment]);

  function galleryImages(product: StoreProduct) {
    return [
      product.image_url ? { src: product.image_url, label: "Mockup da camiseta" } : null,
      product.design_image_url ? { src: product.design_image_url, label: "Estampa em detalhes" } : null
    ].filter((image): image is { src: string; label: string } => Boolean(image));
  }

  function moveGallery(direction: number) {
    setGallery((current) => {
      if (!current) return null;
      const images = galleryImages(current.product);
      return { ...current, index: (current.index + direction + images.length) % images.length };
    });
  }

  function addToCart(product: StoreProduct) {
    const variant = product.variants.find(
      (candidate) => candidate.code === selectedVariants[product.id] && candidate.active === 1
    ) ?? availableVariants(product)[0];
    const size = selectedSizes[product.id] ?? availableSizes(variant)[0];
    const quantity = Math.max(1, Math.min(10, quantities[product.id] ?? 1));
    if (!variant || !size || variant.inventory[size] < quantity) {
      setError("Escolha uma variação e um tamanho disponíveis.");
      return;
    }
    setError("");
    setCart((current) => {
      const index = current.findIndex(
        (item) => item.productId === product.id && item.variantCode === variant.code && item.size === size
      );
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
          variantCode: variant.code,
          variantLabel: variant.label,
          priceCents: variant.price_cents,
          size,
          quantity,
          stock: variant.inventory[size]
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
      const response = await fetch(paymentMethod === "pix" ? "/api/store/pix" : "/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillmentMethod,
          pickupCity: fulfillmentMethod === "athlete_pickup" ? pickupCity : undefined,
          items: cart.map((item) => ({
            productId: item.productId,
            variant: item.variantCode,
            size: item.size,
            quantity: item.quantity
          }))
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível iniciar o pagamento.");
      if (paymentMethod === "pix") {
        if (!result.pixPayload || !result.qrCode) throw new Error("Não foi possível gerar o QR Code Pix.");
        setPixPayment(result as PixPayment);
        setDrawerOpen(false);
        setCheckoutLoading(false);
        return;
      }
      if (!result.url) throw new Error("Não foi possível abrir o checkout.");
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
          <article><BadgeCheck /><span><strong>Personalização para parceiros</strong>Aplicamos o logo dos patrocinadores nas peças do projeto</span></article>
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
            const variants = availableVariants(product);
            const selectedVariant =
              variants.find((variant) => variant.code === selectedVariants[product.id]) ?? variants[0];
            const sizes = availableSizes(selectedVariant);
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
                  {product.design_image_url ? (
                    <button
                      className={styles.viewDesign}
                      type="button"
                      onClick={() => setGallery({ product, index: product.image_url ? 1 : 0 })}
                    >
                      Ver estampa <ArrowRight size={15} />
                    </button>
                  ) : null}
                </div>
                <div className={styles.productDetails}>
                  <span className={styles.productTag}>Casual ou Dri-fit</span>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                  <strong className={styles.price}>
                    {selectedVariant ? currency(selectedVariant.price_cents) : "Indisponível"}
                  </strong>

                  <fieldset className={styles.variantSelector}>
                    <legend>Tecido</legend>
                    <div>
                      {product.variants.map((variant) => (
                        <button
                          className={selectedVariant?.code === variant.code ? styles.variantActive : ""}
                          type="button"
                          key={variant.code}
                          disabled={variant.active !== 1}
                          onClick={() => {
                            setSelectedVariants((current) => ({ ...current, [product.id]: variant.code }));
                            setSelectedSizes((current) => ({
                              ...current,
                              [product.id]: availableSizes(variant)[0] ?? "M"
                            }));
                          }}
                          aria-pressed={selectedVariant?.code === variant.code}
                        >
                          <span>{variant.label}</span>
                          <small>{currency(variant.price_cents)}</small>
                        </button>
                      ))}
                    </div>
                  </fieldset>

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

      {gallery ? (
        <>
          <button className={styles.galleryBackdrop} type="button" aria-label="Fechar galeria" onClick={() => setGallery(null)} />
          <section className={styles.galleryModal} role="dialog" aria-modal="true" aria-label={`Galeria de ${gallery.product.title}`}>
            <header>
              <div>
                <span className="eyebrow">Casual ou Dri-fit</span>
                <h2>{gallery.product.title}</h2>
              </div>
              <button type="button" onClick={() => setGallery(null)} aria-label="Fechar galeria"><X /></button>
            </header>
            <div className={styles.galleryStage}>
              {(() => {
                const images = galleryImages(gallery.product);
                const currentImage = images[gallery.index] ?? images[0];
                return currentImage ? (
                  <Image
                    src={currentImage.src}
                    alt={`${currentImage.label} de ${gallery.product.title}`}
                    fill
                    sizes="(max-width: 760px) 92vw, 760px"
                    unoptimized={currentImage.src.startsWith("/api/")}
                  />
                ) : null;
              })()}
              <button type="button" onClick={() => moveGallery(-1)} aria-label="Imagem anterior"><ChevronLeft /></button>
              <button type="button" onClick={() => moveGallery(1)} aria-label="Próxima imagem"><ChevronRight /></button>
            </div>
            <footer>
              {galleryImages(gallery.product).map((image, index) => (
                <button
                  className={gallery.index === index ? styles.galleryDotActive : ""}
                  type="button"
                  onClick={() => setGallery((current) => current ? { ...current, index } : null)}
                  aria-label={`Ver ${image.label.toLowerCase()}`}
                  aria-pressed={gallery.index === index}
                  key={image.src}
                >
                  <span />
                  {image.label}
                </button>
              ))}
            </footer>
          </section>
        </>
      ) : null}

      {pixPayment ? (
        <>
          <button
            className={styles.galleryBackdrop}
            type="button"
            aria-label="Fechar pagamento Pix"
            onClick={() => setPixPayment(null)}
          />
          <section className={styles.pixModal} role="dialog" aria-modal="true" aria-label="Pagamento por Pix">
            <header>
              <div>
                <span className="eyebrow">Pagamento direto</span>
                <h2>Finalize pelo Pix</h2>
              </div>
              <button type="button" onClick={() => setPixPayment(null)} aria-label="Fechar Pix"><X /></button>
            </header>
            <div className={styles.pixContent}>
              <div className={styles.pixQr}>
                <Image src={pixPayment.qrCode} alt="QR Code Pix do pedido" width={560} height={560} unoptimized />
              </div>
              <div className={styles.pixInstructions}>
                <span>Pedido #{pixPayment.orderId.slice(0, 8).toUpperCase()}</span>
                <strong>{currency(pixPayment.amountCents)}</strong>
                <p>Escaneie o QR Code no aplicativo do seu banco ou copie o código Pix abaixo.</p>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(pixPayment.pixPayload);
                    setPixCopied(true);
                    window.setTimeout(() => setPixCopied(false), 2200);
                  }}
                >
                  {pixCopied ? <Check size={17} /> : <Copy size={17} />}
                  {pixCopied ? "Código copiado" : "Copiar código Pix"}
                </button>
                <small>
                  Referência: {pixPayment.reference}. O pedido ficará aguardando a confirmação do pagamento.
                </small>
              </div>
            </div>
          </section>
        </>
      ) : null}

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
            <article className={styles.cartItem} key={`${item.productId}-${item.variantCode}-${item.size}`}>
              <div className={styles.cartThumb}>
                {item.imageUrl ? <Image src={item.imageUrl} alt="" fill sizes="72px" unoptimized={item.imageUrl.startsWith("/api/")} /> : null}
              </div>
              <div>
                <strong>{item.title}</strong>
                <span>{item.variantLabel} · Tamanho {item.size}</span>
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
          <fieldset className={styles.paymentMethod}>
            <legend>Como deseja pagar?</legend>
            <div>
              <button
                className={paymentMethod === "stripe" ? styles.paymentActive : ""}
                type="button"
                onClick={() => setPaymentMethod("stripe")}
                aria-pressed={paymentMethod === "stripe"}
              >
                <CreditCard size={18} />
                <span><strong>Cartão</strong><small>Ambiente seguro Stripe</small></span>
              </button>
              <button
                className={paymentMethod === "pix" ? styles.paymentActive : ""}
                type="button"
                onClick={() => setPaymentMethod("pix")}
                aria-pressed={paymentMethod === "pix"}
              >
                <QrCode size={18} />
                <span><strong>Pix</strong><small>Direto para a 11RUN</small></span>
              </button>
            </div>
          </fieldset>
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
            {paymentMethod === "pix" ? <QrCode size={18} /> : <ShieldCheck size={18} />}
            {checkoutLoading
              ? "Preparando pagamento..."
              : paymentMethod === "pix"
                ? "Gerar QR Code Pix"
                : "Ir para pagamento seguro"}
          </button>
          <small>
            {paymentMethod === "pix"
              ? "O Pix será gerado diretamente para a mesma conta oficial das doações 11RUN."
              : "Você será direcionado ao ambiente seguro da Stripe para pagar com cartão."}
          </small>
          <small>
            Ao continuar, seus dados serão usados para processar o pedido, pagamento e entrega conforme a{" "}
            <Link href="/politica-de-privacidade" target="_blank">Política de Privacidade</Link>.
          </small>
        </footer>
      </aside>
    </main>
  );
}
