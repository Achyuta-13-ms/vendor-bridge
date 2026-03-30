import { Link } from "react-router-dom";
import { Shield, Lock } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold text-foreground">VendorFlow</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            India's trusted vendor onboarding and verification infrastructure for modern marketplaces.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>256-bit encrypted · KYC compliant</span>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Product</h4>
          <div className="flex flex-col gap-2">
            <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/api-docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Docs</Link>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Company</h4>
          <div className="flex flex-col gap-2">
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            <span className="text-sm text-muted-foreground">Privacy Policy</span>
            <span className="text-sm text-muted-foreground">Terms of Service</span>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Support</h4>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">help@vendorflow.in</span>
            <span className="text-sm text-muted-foreground">+91 98765 43210</span>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} VendorFlow. All rights reserved. Built in India 🇮🇳
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
