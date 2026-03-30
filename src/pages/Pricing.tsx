import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
  }),
};

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
    variant: "hero-outline" as const,
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
    variant: "hero" as const,
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
    variant: "hero-outline" as const,
    highlight: false,
  },
];

const Pricing = () => (
  <PublicLayout>
    <section className="bg-gradient-hero py-20">
      <div className="container text-center">
        <motion.h1
          initial="hidden" animate="visible" custom={0} variants={fadeUp}
          className="text-4xl font-extrabold text-foreground md:text-5xl"
        >
          Simple, Transparent{" "}
          <span className="text-gradient-primary">Pricing</span>
        </motion.h1>
        <motion.p
          initial="hidden" animate="visible" custom={1} variants={fadeUp}
          className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Start free. Scale as you grow. Pay only for what you use.
        </motion.p>
      </div>
    </section>

    <section className="container py-20">
      <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            custom={i} variants={fadeUp}
            className={`rounded-2xl border p-8 flex flex-col ${
              plan.highlight
                ? "border-primary shadow-elevated bg-card relative"
                : "border-border bg-card shadow-card"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
              {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>

            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link to="/signup" className="mt-8">
              <Button variant={plan.variant} className="w-full gap-2">
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-muted-foreground">
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
