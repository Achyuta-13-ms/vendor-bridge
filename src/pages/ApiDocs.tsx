import PublicLayout from "@/components/layout/PublicLayout";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

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

const CodeBlock = ({ code, label }: { code: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <pre className="rounded-lg border border-border bg-muted/50 p-3.5 text-xs text-foreground overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const ApiDocs = () => (
  <PublicLayout>
    <section className="border-b border-border py-16">
      <div className="container text-center">
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
          API <span className="text-primary">Documentation</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
          Integrate VendorFlow into your platform with our simple REST API.
        </p>
      </div>
    </section>

    <section className="container py-16">
      <div className="max-w-3xl mx-auto">
        {/* Auth */}
        <div className="mb-10 rounded-xl border border-border bg-card p-5 shadow-xs">
          <h2 className="text-base font-semibold text-foreground mb-2">Authentication</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Include your API key in the Authorization header for all requests.
          </p>
          <CodeBlock label="Header" code="Authorization: Bearer YOUR_API_KEY" />
        </div>

        {/* Endpoints */}
        <h2 className="text-lg font-semibold text-foreground mb-5">Endpoints</h2>
        <div className="space-y-5">
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              className="rounded-xl border border-border bg-card p-5 shadow-xs"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                  ep.method === "GET"
                    ? "bg-secondary/10 text-secondary"
                    : "bg-primary/10 text-primary"
                }`}>
                  {ep.method}
                </span>
                <code className="text-sm font-medium text-foreground">{ep.path}</code>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{ep.desc}</p>
              <div className="space-y-3">
                {ep.body && <CodeBlock label="Request Body" code={ep.body} />}
                <CodeBlock label="Response" code={ep.response} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default ApiDocs;
