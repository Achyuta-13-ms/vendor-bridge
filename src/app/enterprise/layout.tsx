import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Enterprise Dashboard | VyapaarSetu',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <EnterpriseLayout>{children}</EnterpriseLayout>;
}
