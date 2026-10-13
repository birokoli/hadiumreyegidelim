import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/profil/AuthShell";
import UyeOlForm from "@/components/profil/UyeOlForm";
import { safeNext } from "@/components/profil/fields";
import { getMember } from "@/lib/members";

export const metadata: Metadata = { title: "Ücretsiz üye ol | Hadi Umreye Gidelim" };

export default async function UyeOlPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getMember()) redirect(next);
  return (
    <AuthShell kicker="Ücretsiz üyelik" title="Umreniz *cebinizde*">
      <UyeOlForm next={next} />
    </AuthShell>
  );
}
