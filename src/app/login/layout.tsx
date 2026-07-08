import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Vendor Login',
  description: 'Log in to your VyapaarSetu vendor dashboard.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
