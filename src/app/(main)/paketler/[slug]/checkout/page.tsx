import React from "react";
import { Metadata } from "next";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PackageCheckoutClient from "@/components/packages/PackageCheckoutClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default async function PackageCheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await prisma.package.findUnique({
    where: { slug },
  });

  if (!pkg || !pkg.published) {
    notFound();
  }

  return <PackageCheckoutClient pkg={pkg} />;
}
