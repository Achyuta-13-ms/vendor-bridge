"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Building2, 
  Store, 
  Landmark, 
  Truck, 
  ShoppingCart,
  CheckCircle2,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Building
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } }
};

const Index = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-32 pb-24 border-b border-border/40">
        <div className="container relative mx-auto px-4 lg:flex lg:items-center lg:gap-12">
          
          {/* Hero Text */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2 text-center lg:text-left z-10"
          >
            <h1 className="text-5xl font-extrabold tracking-tight text-black sm:text-6xl md:text-7xl leading-[1.1] mb-6">
              Create Once.<br/>
              <span className="text-black">Trust Everywhere.</span>
            </h1>
            
            <p className="mt-6 text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              VyapaarSetu helps businesses create one verified digital identity that can be securely shared across enterprises, marketplaces, banks and procurement platforms.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 text-lg shadow-sm hover:shadow-md transition-all rounded-lg font-medium bg-black text-white hover:bg-black/90">
                  Create Business Identity
                </Button>
              </Link>
              <Link href="/#book-demo">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-lg border-zinc-200 text-black hover:bg-zinc-50 font-medium transition-all">
                  Book Enterprise Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 mt-16 lg:mt-0 relative h-[600px] flex items-center justify-center"
          >
            {/* Background elements */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[80px]" />
            </div>

            {/* Connecting Lines SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              <motion.g 
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              >
                <path d="M 50% 50% L 20% 20%" stroke="#e4e4e7" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                <path d="M 50% 50% L 80% 20%" stroke="#e4e4e7" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                <path d="M 50% 50% L 80% 80%" stroke="#e4e4e7" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                <path d="M 50% 50% L 20% 80%" stroke="#e4e4e7" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                <path d="M 50% 50% L 90% 50%" stroke="#e4e4e7" strokeWidth="1" fill="none" strokeDasharray="4 4" />
              </motion.g>
            </svg>

            {/* Peripheral Nodes */}
            <PeripheralNode top="10%" left="15%" icon={Building} label="Enterprise" delay={0.6} />
            <PeripheralNode top="10%" right="15%" icon={Store} label="Marketplace" delay={0.7} />
            <PeripheralNode bottom="10%" right="15%" icon={Landmark} label="Bank" delay={0.8} />
            <PeripheralNode bottom="10%" left="15%" icon={ShoppingCart} label="Procurement" delay={0.9} />
            <PeripheralNode top="45%" right="5%" icon={Truck} label="Logistics" delay={1.0} />

            {/* Center Identity Card */}
            <motion.div 
              className="relative z-10 bg-white border border-zinc-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 w-[320px]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgb(0,0,0,0.08)" }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg text-black">Acme Corp Ltd.</h3>
                  <p className="text-xs font-mono text-zinc-500 mt-1">ID: VYP-8829-XJ</p>
                </div>
                <div className="bg-orange-50 text-orange-600 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Trust: 99
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <VerificationBadge label="GST Verified" />
                <VerificationBadge label="PAN Verified" />
                <VerificationBadge label="Compliance Active" />
              </div>

              <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
                <div className="text-xs text-zinc-400">Scanned 2m ago</div>
                <QrCode className="w-8 h-8 text-zinc-300" />
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-zinc-50 border-b border-zinc-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-10">Built for Modern Digital Commerce</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale">
            <div className="flex items-center gap-2 text-xl font-bold font-sans text-black"><Building2 className="w-6 h-6"/> Enterprise</div>
            <div className="flex items-center gap-2 text-xl font-bold font-sans text-black"><Store className="w-6 h-6"/> Marketplace</div>
            <div className="flex items-center gap-2 text-xl font-bold font-sans text-black"><Landmark className="w-6 h-6"/> Banking</div>
            <div className="flex items-center gap-2 text-xl font-bold font-sans text-black"><ShieldCheck className="w-6 h-6"/> Gov. Platforms</div>
            <div className="flex items-center gap-2 text-xl font-bold font-sans text-black"><Truck className="w-6 h-6"/> Logistics</div>
          </div>
        </div>
      </section>

      {/* Content Sections (Simplified for Enterprise Vibe) */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-6 mx-auto md:mx-0">
                <ShieldCheck className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-black">Verified Once</h3>
              <p className="text-zinc-600 leading-relaxed">
                Connect your GST, PAN, and Bank details once. We verify them against authoritative government databases in real-time.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-6 mx-auto md:mx-0">
                <Store className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-black">Accepted Everywhere</h3>
              <p className="text-zinc-600 leading-relaxed">
                Share your VyapaarSetu Identity across our network of 200+ partner marketplaces, banks, and enterprises instantly.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-6 mx-auto md:mx-0">
                <Building className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-black">Enterprise Grade</h3>
              <p className="text-zinc-600 leading-relaxed">
                Built on infrastructure designed for scale. SOC2 compliant, end-to-end encrypted, and highly available.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight text-white">Join the Identity Network</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Stop filling out the same forms. Start building trust.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-8 text-lg bg-orange-500 text-white hover:bg-orange-600 rounded-lg font-medium border-0">
                Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
};

function VerificationBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-700 bg-zinc-50 py-2 px-3 rounded-md border border-zinc-100">
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      <span className="font-medium">{label}</span>
    </div>
  );
}

function PeripheralNode({ 
  top, bottom, left, right, icon: Icon, label, delay 
}: { 
  top?: string, bottom?: string, left?: string, right?: string, icon: any, label: string, delay: number 
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className="absolute flex items-center justify-center"
      style={{ top, bottom, left, right, zIndex: 10 }}
    >
      <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-sm flex flex-col items-center gap-2 w-24">
        <Icon className="w-6 h-6 text-zinc-400" />
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>
    </motion.div>
  );
}

export default Index;
