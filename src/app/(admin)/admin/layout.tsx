import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: {
    index: false,
    follow: false,
  }
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let logoUrl = "/logo.png";
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'SITE_LOGO' } });
    if (setting?.value) {
      logoUrl = setting.value;
    }
  } catch (e) {
    console.error("Could not load SITE_LOGO", e);
  }
  return (
    <AdminLayoutWrapper 
      sidebar={<AdminSidebar logoUrl={logoUrl} />} 
      navbar={<AdminNavbar />}
    >
      {children}
    </AdminLayoutWrapper>
  );
}
