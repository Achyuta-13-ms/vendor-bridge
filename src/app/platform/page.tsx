import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Fingerprint, Activity, Network, ArrowRight } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

export default function PlatformPage() {
  return (
    <PublicLayout>
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-black tracking-tight leading-tight">
            The infrastructure for <br />
            <span className="text-orange-500">Business Identity</span>
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            VyapaarSetu provides a unified layer for businesses to verify, manage, and share their identity across the digital ecosystem seamlessly.
          </p>
          <div className="pt-4">
            <Link href="/onboarding">
              <Button size="lg" className="h-14 px-8 text-lg bg-black text-white hover:bg-black/90 font-bold rounded-xl shadow-lg">
                Create Business Identity <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            
            {/* Feature 1 */}
            <div className="space-y-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-black">Unified Identity Card</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">
                Create a single, verified digital identity. Stop filling out repetitive vendor onboarding forms. Generate a unique ID and QR code to share instantly with partners.
              </p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-[24px] shadow-xl p-8 aspect-square flex items-center justify-center">
              <div className="w-full max-w-sm bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[16px] p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg"></div>
                  <div>
                    <div className="h-4 w-24 bg-zinc-200 rounded mb-2"></div>
                    <div className="h-3 w-32 bg-zinc-100 rounded"></div>
                  </div>
                </div>
                <div className="h-px w-full bg-zinc-100 my-4"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Verified</span>
                  <div className="w-8 h-8 bg-zinc-100 rounded"></div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-zinc-200 rounded-[24px] shadow-xl p-8 aspect-square flex items-center justify-center order-last md:order-none">
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex flex-col items-center justify-center gap-2 aspect-square">
                  <ShieldCheck className="w-8 h-8 text-orange-500" />
                  <span className="font-bold text-sm">GST Active</span>
                </div>
                <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl flex flex-col items-center justify-center gap-2 aspect-square">
                  <Activity className="w-8 h-8 text-zinc-400" />
                  <span className="font-bold text-sm text-zinc-500">Monitoring</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-black">Continuous Compliance</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">
                We continuously monitor your business status against government databases. Automatically renew verified badges and maintain absolute trust with your network.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-zinc-200">
        <div className="max-w-4xl mx-auto text-center px-4 space-y-8">
          <h2 className="text-4xl font-extrabold text-black">Ready to establish trust?</h2>
          <p className="text-xl text-zinc-500">Join thousands of businesses managing their identity on VyapaarSetu.</p>
          <Link href="/onboarding" className="inline-block mt-4">
            <Button size="lg" className="h-14 px-8 text-lg bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-xl shadow-lg">
              Create Business Identity
            </Button>
          </Link>
        </div>
      </section>
    </div>
    </PublicLayout>
  );
}
