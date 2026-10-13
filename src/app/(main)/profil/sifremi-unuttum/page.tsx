import type { Metadata } from "next";
import AuthShell from "@/components/profil/AuthShell";
import SifreForm from "@/components/profil/SifreForm";

export const metadata: Metadata = { title: "Şifremi unuttum | Hadi Umreye Gidelim" };

export default async function SifremiUnuttumPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const email = String((await searchParams).email ?? "").slice(0, 120);
  return (
    <AuthShell kicker="Hesabınız" title="Şifrenizi *yenileyin*">
      <SifreForm initialEmail={email} />
    </AuthShell>
  );
}
