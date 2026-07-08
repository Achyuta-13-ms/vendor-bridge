"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard, LogOut, Shield } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/platform" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center gap-3 group transition-all duration-300">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-sm group-hover:shadow-elevated transition-all duration-300 overflow-hidden border border-border/50">
            <img 
              src="/logo.png" 
              alt="VyapaarSetu" 
              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">VyapaarSetu</span>
        </Link>


        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`px-4 font-semibold ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" ? (
            <div className="h-9 w-24 bg-zinc-100 rounded-lg animate-pulse" />
          ) : session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1.5 font-semibold">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="gap-1.5 font-semibold" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-foreground hover:bg-muted/50">Login</Button>
              </Link>
              <Link href="/onboarding">
                <Button size="sm" className="rounded-lg font-bold px-5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">Create Business Identity</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4 shadow-lg absolute w-full">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start font-semibold ${
                    pathname === link.href ? "text-primary bg-primary/5" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex flex-col gap-3">
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start font-semibold">
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start font-semibold" onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full font-semibold">Login</Button>
                </Link>
                <Link href="/onboarding" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90">Create Business Identity</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
