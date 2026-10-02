import { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return children;
}
