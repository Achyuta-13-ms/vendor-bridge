import Link from "next/link";
import { Shield, Lock, Twitter, Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container py-20 px-4 mx-auto">
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-16">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-green-glow overflow-hidden border border-border/50 transition-all duration-300 group-hover:shadow-green-glow-lg">
              <img 
                src="/logo.png" 
                alt="VyapaarSetu" 
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">VyapaarSetu</span>
          </Link>

          <p className="text-muted-foreground leading-relaxed">
            The modern infrastructure for vendor onboarding in India. 
            Automating compliance so you can focus on scale.
          </p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 hover:text-primary">
              <Linkedin className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 hover:text-primary">
              <Github className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div>
          <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">Product</h4>
          <ul className="space-y-4">
            <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">Auto KYC <ArrowUpRight className="h-3 w-3" /></Link></li>
            <li><Link href="#use-cases" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">Use Cases <ArrowUpRight className="h-3 w-3" /></Link></li>
            <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link href="/api-docs" className="text-muted-foreground hover:text-primary transition-colors">API Reference</Link></li>
            <li><Link href="/dashboard/simulator" className="text-muted-foreground hover:text-primary transition-colors">Sandbox</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">Resources</h4>
          <ul className="space-y-4">
            <li><Link href="/api-docs" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
            <li><span className="text-muted-foreground cursor-not-allowed opacity-50">Blog (Coming Soon)</span></li>
            <li><span className="text-muted-foreground cursor-not-allowed opacity-50">Changelog</span></li>
            <li><span className="text-muted-foreground cursor-not-allowed opacity-50">Status Page</span></li>
            <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Integration Guide</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">Contact</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>founders@vyapaarsetu.in</span>
            </div>
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm font-bold text-foreground mb-2">Build in India 🇮🇳</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                HSR Layout, Sector 7<br />
                Bangalore, KA 560102
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-xs text-muted-foreground order-2 md:order-1">
          © {new Date().getFullYear()} VyapaarSetu Technologies Pvt. Ltd. All rights reserved.
        </p>
        <div className="flex items-center gap-8 order-1 md:order-2">
          <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary">Privacy Policy</Link>
          <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary">Terms of Service</Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium border border-border px-2.5 py-1 rounded-full bg-muted/30">
            <Lock className="h-3 w-3" /> 256-bit Secure
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
