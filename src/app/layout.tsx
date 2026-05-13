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
  title: 'VyapaarSetu',
  description: 'Vendor onboarding infrastructure for marketplaces, hyperlocal delivery startups, and ONDC ecosystems.',
  icons: {
    icon: '/favicon.svg',
  },
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
