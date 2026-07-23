import { StoreAdmin } from "@/components/StoreAdmin";
import { listOrders, listProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function StoreAdminPage() {
  return <StoreAdmin initialProducts={listProducts({ activeOnly: false })} initialOrders={listOrders()} />;
}
