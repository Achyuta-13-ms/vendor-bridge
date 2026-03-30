import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "API Docs", href: "/api-docs" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">VendorFlow</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={location.pathname === link.href ? "text-primary" : "text-muted-foreground"}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button variant="hero" size="sm">Get Started</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-background md:hidden"
          >
            <div className="container flex flex-col gap-2 py-4">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">{link.label}</Button>
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}>
                  <Button variant="hero" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
