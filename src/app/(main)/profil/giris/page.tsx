import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/profil/AuthShell";
import GirisForm from "@/components/profil/GirisForm";
import { safeNext } from "@/components/profil/fields";
import { getMember } from "@/lib/members";

export const metadata: Metadata = { title: "Giriş yap | Hadi Umreye Gidelim" };

export default async function GirisPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getMember()) redirect(next);
  return (
    <AuthShell kicker="Hadi Umreye Gidelim üyeliği" title="Tekrar *hoş geldiniz*">
      <GirisForm next={next} />
    </AuthShell>
  );
}
