// Şavt modu sayfası (üyelere özel): /profil/oku/tavaf, /profil/oku/say
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getKitapcik } from "@/lib/kitapcik";
import Okuyucu from "@/components/profil/Okuyucu";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const k = getKitapcik((await params).slug);
  return { title: k ? `${k.ad} · Şavt modu` : "Kitaplık" };
}

export default async function OkuPage({ params }: { params: Promise<{ slug: string }> }) {
  const k = getKitapcik((await params).slug);
  if (!k) notFound();
  return <Okuyucu k={k} />;
}
