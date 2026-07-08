import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

const plans = [
  {
    name: "Business",
    price: "₹999",
    period: "/month",
    description: "Perfect for growing businesses establishing their digital identity.",
    features: [
      "1 Verified Business Identity",
      "Unlimited Identity Sharing",
      "Basic Compliance Monitoring",
      "Standard Support",
    ],
    cta: "Get Started",
    href: "/onboarding",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations verifying thousands of vendors.",
    features: [
      "API Access for Vendor Verification",
      "Automated Compliance Engine",
      "Custom Workflow Integration",
      "Dedicated Account Manager",
      "SLA Guarantees",
    ],
    cta: "Contact Sales",
    href: "/contact",
    popular: true,
  }
];

export default function PricingPage() {
  return (
    <PublicLayout>
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-zinc-500">
            No hidden fees. Create your verified business identity today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`bg-white rounded-[24px] p-8 md:p-10 border relative ${
                plan.popular 
                  ? "border-orange-500 shadow-[0_20px_60px_rgb(249,115,22,0.1)]" 
                  : "border-zinc-200 shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
              <p className="text-zinc-500 mb-6 h-12">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-black">{plan.price}</span>
                <span className="text-zinc-500 font-medium">{plan.period}</span>
              </div>

              <Link href={plan.href} className="block w-full mb-8">
                <Button 
                  className={`w-full h-14 text-lg font-bold rounded-xl ${
                    plan.popular 
                      ? "bg-orange-500 hover:bg-orange-600 text-white" 
                      : "bg-black hover:bg-black/90 text-white"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>

              <div className="space-y-4">
                <p className="font-semibold text-black mb-4">What's included:</p>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-black" strokeWidth={3} />
                    </div>
                    <span className="text-zinc-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}
