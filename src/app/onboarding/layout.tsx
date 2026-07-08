import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Vendor Onboarding',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
