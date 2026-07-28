import type { Metadata } from "next";
import { BrandingAdmin } from "@/components/BrandingAdmin";
import { listBrandingRequests } from "@/lib/branding";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Branding | Admin 11Run" };

export default function BrandingAdminPage() {
  return <BrandingAdmin initialRequests={listBrandingRequests()} />;
}
