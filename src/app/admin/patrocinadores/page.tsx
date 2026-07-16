import { SponsorsAdmin } from "@/components/SponsorsAdmin";
import { listSponsors } from "@/lib/sponsors";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Patrocinadores | Admin 11RUN"
};

export default function SponsorsAdminPage() {
  const sponsors = listSponsors({ activeOnly: false });

  return <SponsorsAdmin initialSponsors={sponsors} />;
}
