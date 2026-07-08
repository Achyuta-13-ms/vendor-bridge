import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

import { AuthProvider } from '@/hooks/useAuth'

import { NextAuthProvider } from '@/components/providers/next-auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: "%s | VyapaarSetu",
    default: "VyapaarSetu - The Ultimate Vendor Bridge"
  },
  description: 'VyapaarSetu provides seamless vendor onboarding infrastructure for marketplaces, hyperlocal delivery startups, and ONDC ecosystems.',
  keywords: ["vendor onboarding", "marketplace", "B2B", "SaaS", "VyapaarSetu", "vendor bridge"],
  icons: {
    icon: '/logo.png',
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: "https://vyapaarsetu.com",
    title: "VyapaarSetu - The Ultimate Vendor Bridge",
    description: "Seamless vendor onboarding infrastructure.",
    siteName: "VyapaarSetu",
    images: [{
      url: "/logo.png",
      width: 512,
      height: 512,
      alt: "VyapaarSetu Logo"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "VyapaarSetu - The Ultimate Vendor Bridge",
    description: "Seamless vendor onboarding infrastructure.",
    images: ["/logo.png"]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {children}
              <Toaster />
              <SonnerToaster position="top-right" expand={false} richColors />
            </AuthProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
