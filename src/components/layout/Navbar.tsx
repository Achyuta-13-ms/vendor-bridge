"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, LayoutDashboard, LogOut } from "lucide-react";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Use Cases", href: "/#use-cases" },
  { label: "Pricing", href: "/pricing" },
  { label: "API Docs", href: "/api-docs" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<{ id: string; phone: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("vendorSession");
    setSession(raw ? JSON.parse(raw) : null);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("vendorSession");
    localStorage.removeItem("vendorId");
    setSession(null);
    setMobileOpen(false);
    router.push("/");
  };

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
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1.5 font-semibold">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="gap-1.5 font-semibold" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold">Log in</Button>
              </Link>
              <Link href="/#book-demo">
                <Button size="sm" className="rounded-xl font-bold px-5">Book Demo</Button>
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
        <div className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-4 mx-auto px-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full gap-2 rounded-xl font-bold">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full gap-2 rounded-xl font-bold" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl font-bold">Log in</Button>
                  </Link>
                  <Link href="/#book-demo" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full rounded-xl font-bold">Book Demo</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
