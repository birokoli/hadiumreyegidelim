import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PackageCheckoutClient from '@/components/packages/PackageCheckoutClient';

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
