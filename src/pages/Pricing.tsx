import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "For vendors getting started with VendorFlow.",
    features: [
      "Unlimited document uploads",
      "3 free verifications/month",
      "Reusable vendor profile",
      "Email support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹4,999",
    period: "/month",
    desc: "For platforms onboarding vendors at scale.",
    features: [
      "Up to 500 verifications/month",
      "REST API access",
      "Webhook notifications",
      "Dashboard analytics",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large platforms needing dedicated infrastructure.",
    features: [
      "Unlimited verifications",
      "Dedicated API endpoints",
      "Custom SLA",
      "White-label options",
      "Dedicated account manager",
      "On-premise deployment",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

const Pricing = () => (
  <PublicLayout>
    <section className="border-b border-border py-16">
      <div className="container text-center">
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
          Simple, transparent <span className="text-primary">pricing</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
          Start free. Scale as you grow. Pay only for what you use.
        </p>
      </div>
    </section>

    <section className="container py-16">
      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-6 flex flex-col ${
              plan.highlight
                ? "border-primary shadow-card bg-card relative"
                : "border-border bg-card shadow-xs"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[11px] font-medium text-primary-foreground">
                Most Popular
              </div>
            )}
            <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-foreground">{plan.price}</span>
              {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{plan.desc}</p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                  <Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link to={plan.name === "Enterprise" ? "/contact" : "/signup"} className="mt-6">
              <Button
                variant={plan.highlight ? "default" : "outline"}
                className="w-full gap-2"
              >
                {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-muted-foreground">
          Need custom pricing?{" "}
          <Link to="/contact" className="text-primary font-medium hover:underline">
            Talk to our sales team
          </Link>
        </p>
      </div>
    </section>
  </PublicLayout>
);

export default Pricing;
