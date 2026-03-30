import PublicLayout from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" }
  }),
};

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/vendor/create",
    desc: "Create a new vendor profile",
    body: `{
  "phone": "+919876543210",
  "name": "Rajesh Kumar",
  "business_name": "Kumar Enterprises",
  "address": "Mumbai, Maharashtra"
}`,
    response: `{
  "vendor_id": "vf_abc123",
  "status": "created",
  "profile_url": "https://vendorflow.in/v/vf_abc123"
}`,
  },
  {
    method: "POST",
    path: "/api/v1/vendor/verify",
    desc: "Trigger KYC verification for a vendor",
    body: `{
  "vendor_id": "vf_abc123",
  "documents": {
    "gst_number": "29ABCDE1234F1Z5",
    "pan_number": "ABCDE1234F",
    "bank_account": "1234567890",
    "ifsc_code": "SBIN0001234"
  }
}`,
    response: `{
  "verification_id": "ver_xyz789",
  "status": "processing",
  "checks": {
    "gst": "pending",
    "pan": "pending",
    "bank": "pending"
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/vendor/:id",
    desc: "Fetch a verified vendor profile",
    body: null,
    response: `{
  "vendor_id": "vf_abc123",
  "name": "Rajesh Kumar",
  "business_name": "Kumar Enterprises",
  "verification": {
    "gst": "verified",
    "pan": "verified",
    "bank": "verified"
  },
  "profile_url": "https://vendorflow.in/v/vf_abc123"
}`,
  },
  {
    method: "POST",
    path: "/api/v1/webhook/register",
    desc: "Register a webhook endpoint",
    body: `{
  "url": "https://yourplatform.com/webhooks/vendor",
  "events": ["vendor.verified", "vendor.failed"]
}`,
    response: `{
  "webhook_id": "wh_def456",
  "status": "active"
}`,
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-secondary/10 text-secondary",
  POST: "bg-primary/10 text-primary",
};

const CodeBlock = ({ code, label }: { code: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="rounded-lg bg-foreground/5 p-4 text-xs text-foreground overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const ApiDocs = () => (
  <PublicLayout>
    <section className="bg-gradient-hero py-20">
      <div className="container text-center">
        <motion.h1
          initial="hidden" animate="visible" custom={0} variants={fadeUp}
          className="text-4xl font-extrabold text-foreground md:text-5xl"
        >
          API <span className="text-gradient-primary">Documentation</span>
        </motion.h1>
        <motion.p
          initial="hidden" animate="visible" custom={1} variants={fadeUp}
          className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Integrate VendorFlow into your platform with our simple REST API.
        </motion.p>
      </div>
    </section>

    <section className="container py-20">
      <div className="max-w-4xl mx-auto">
        {/* Auth */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          custom={0} variants={fadeUp}
          className="mb-12 rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <h2 className="text-xl font-bold text-foreground mb-3">Authentication</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Include your API key in the Authorization header for all requests.
          </p>
          <CodeBlock
            label="Header"
            code={`Authorization: Bearer YOUR_API_KEY`}
          />
        </motion.div>

        {/* Endpoints */}
        <h2 className="text-2xl font-bold text-foreground mb-6">Endpoints</h2>
        <div className="space-y-8">
          {endpoints.map((ep, i) => (
            <motion.div
              key={ep.path}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              custom={i} variants={fadeUp}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${methodColors[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="text-sm font-semibold text-foreground">{ep.path}</code>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{ep.desc}</p>
              <div className="space-y-4">
                {ep.body && <CodeBlock label="Request Body" code={ep.body} />}
                <CodeBlock label="Response" code={ep.response} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default ApiDocs;
