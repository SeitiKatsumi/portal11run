import type { Metadata } from "next";
import { AdminChallenges } from "@/components/AdminChallenges";
import { getChallengeAdminData } from "@/lib/member-challenges";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gestão de Desafios | Admin 11RUN", robots: { index: false, follow: false } };

export default function AdminChallengesPage() {
  return <AdminChallenges initialData={JSON.parse(JSON.stringify(getChallengeAdminData()))} />;
}
