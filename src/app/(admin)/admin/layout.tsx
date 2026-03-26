import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let logoUrl = "/logo.png";
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'logo_url' } });
    if (setting?.value) {
      logoUrl = setting.value;
    }
  } catch (e) {
    console.error("Could not load logo_url", e);
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
