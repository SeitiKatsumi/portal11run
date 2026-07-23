import type { Metadata } from "next";
import { Storefront } from "@/components/Storefront";
import { listProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Loja 11RUN",
  description: "Camisetas oficiais da 11RUN. Vista o projeto e ajude a fortalecer o atletismo."
};

export default async function StorePage({
  searchParams
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const params = await searchParams;
  return <Storefront initialProducts={listProducts()} checkoutCancelled={params.checkout === "cancelado"} />;
}
