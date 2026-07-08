import DashboardLayout from "@/components/layout/DashboardLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Dashboard',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
