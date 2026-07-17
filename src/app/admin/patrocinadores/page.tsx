import { AdminDataNotice } from "@/components/AdminDataNotice";
import { SponsorsAdmin } from "@/components/SponsorsAdmin";
import { safeAdminData } from "@/lib/adminSafeData";
import { listSponsors } from "@/lib/sponsors";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Patrocinadores | Admin 11RUN"
};

export default function SponsorsAdminPage() {
  const sponsors = safeAdminData("patrocinadores", () => listSponsors({ activeOnly: false }), []);

  return (
    <>
      <AdminDataNotice errors={sponsors.error ? [sponsors.error] : []} />
      <SponsorsAdmin initialSponsors={sponsors.data} />
    </>
  );
}
