"use client";

import { useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown, ChevronRight, Shield, Zap, Key, Webhook } from "lucide-react";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PUT: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-blue-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  return (
    <div className="relative">
      <pre className="bg-[#0d1117] text-[#e6edf3] text-xs rounded-xl p-4 overflow-x-auto font-mono leading-relaxed border border-white/5">
        <code>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function EndpointCard({
  method,
  path,
  summary,
  description,
  request,
  response,
}: {
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  request?: string;
  response: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card shadow-xs">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <Badge className={`text-xs font-mono font-bold px-2 py-0.5 border ${METHOD_COLORS[method]}`} variant="outline">
          {method}
        </Badge>
        <code className="text-sm font-mono text-foreground flex-1">{path}</code>
        <span className="text-xs text-muted-foreground hidden sm:block">{summary}</span>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground ml-2 shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-border p-5 space-y-5 bg-muted/20">
          <p className="text-sm text-muted-foreground">{description}</p>
          {request && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Request Body</p>
              <CodeBlock code={request} />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Response</p>
            <CodeBlock code={response} />
          </div>
        </div>
      )}
    </div>
  );
}

const authSection = [
  {
    method: "POST" as HttpMethod,
    path: "/api/auth/send-otp",
    summary: "Send OTP to phone",
    description: "Sends a one-time password to the specified phone number. In sandbox mode the OTP is always 123456.",
    request: `{
  "phone": "9876543210"
}`,
    response: `{
  "success": true,
  "message": "OTP sent successfully"
}`,
  },
  {
    method: "POST" as HttpMethod,
    path: "/api/auth/verify-otp",
    summary: "Verify OTP and get session token",
    description: "Verifies the OTP for the given phone number. Returns a JWT token and user object on success. Use the token as a Bearer header in all subsequent requests.",
    request: `{
  "phone": "9876543210",
  "otp": "123456"
}`,
    response: `{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_abc123",
    "phone": "9876543210"
  }
}`,
  },
];

const vendorSection = [
  {
    method: "POST" as HttpMethod,
    path: "/api/vendor/create",
    summary: "Create a vendor profile",
    description: "Creates a new vendor profile with business info and document URLs. Documents should be uploaded to your storage first and their URLs passed here.",
    request: `{
  "name": "Rahul Sharma",
  "businessName": "Sharma Enterprises",
  "address": "123 Main St",
  "city": "New Delhi",
  "phone": "9876543210",
  "documents": {
    "gst": "https://cdn.example.com/gst-cert.pdf",
    "pan": "https://cdn.example.com/pan-card.pdf",
    "bank": "https://cdn.example.com/cheque.pdf"
  }
}`,
    response: `{
  "success": true,
  "vendor": {
    "id": "VND-001",
    "businessName": "Sharma Enterprises",
    "overallStatus": "Pending",
    "statuses": {
      "gst": "Verified",
      "pan": "Verified",
      "bank": "Pending"
    },
    "createdAt": "2026-04-09T12:00:00.000Z"
  }
}`,
  },
  {
    method: "GET" as HttpMethod,
    path: "/api/vendors",
    summary: "List all vendors",
    description: "Returns a paginated list of all vendor profiles in your account, including their document verification statuses.",
    response: `{
  "success": true,
  "vendors": [
    {
      "id": "VND-001",
      "businessName": "Sharma Enterprises",
      "city": "New Delhi",
      "overallStatus": "Verified",
      "documents": { "gst": "...", "pan": "...", "bank": "..." },
      "statuses": {
        "gst": "Verified",
        "pan": "Verified",
        "bank": "Verified"
      }
    }
  ]
}`,
  },
  {
    method: "GET" as HttpMethod,
    path: "/api/vendor?userId={userId}",
    summary: "Get vendor by user ID",
    description: "Fetches the vendor profile linked to a specific authenticated user. Returns null if the user has not completed onboarding.",
    response: `{
  "success": true,
  "vendor": {
    "id": "VND-001",
    "userId": "usr_abc123",
    "businessName": "Sharma Enterprises",
    "address": "123 Main St",
    "documents": [...],
    "createdAt": "2026-04-09T12:00:00.000Z"
  }
}`,
  },
  {
    method: "POST" as HttpMethod,
    path: "/api/vendor/verify",
    summary: "Update document verification status (Admin)",
    description: "Updates the verification status of a specific document. Used by platform admins to approve or reject KYC documents.",
    request: `{
  "documentId": "doc_123",
  "status": "Verified",
  "rejectionReason": ""
}`,
    response: `{
  "success": true,
  "verification": {
    "id": "ver_456",
    "status": "Verified",
    "updatedAt": "2026-04-09T15:00:00Z"
  }
}`,
  },
];

const features = [
  { icon: Shield, title: "Secure by Default", desc: "All requests are authenticated with JWT tokens. API keys available for server-to-server use." },
  { icon: Zap, title: "Instant Verification", desc: "GST and PAN verification responses in under 30 seconds via government APIs." },
  { icon: Key, title: "Sandbox Mode", desc: "Test your integration without real documents. OTP is always 123456 in sandbox." },
  { icon: Webhook, title: "Webhooks", desc: "Get notified via POST when a vendor's verification status changes." },
];

export default function ApiDocsPage() {
  return (
    <PublicLayout>
      <div className="py-20 px-4">
        <div className="container mx-auto max-w-4xl space-y-16">

          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/15 px-3.5 py-1.5 text-xs font-medium text-primary">
              <Key className="h-3 w-3" /> API Reference — v1.0
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              VyapaarSetu API Documentation
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Everything you need to integrate vendor KYC verification into your marketplace.
              RESTful, JSON-based, and built for production.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Badge variant="secondary" className="font-mono">Base URL: https://api.vyapaarsetu.in/v1</Badge>
              <Badge variant="outline">REST · JSON</Badge>
            </div>
          </div>

          {/* Quick start */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Quick Start</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="rounded-lg border border-border bg-card p-4 flex gap-3 shadow-xs">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Auth header */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Authentication</h2>
            <p className="text-sm text-muted-foreground">
              Include your JWT token in the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">Authorization</code> header for all protected endpoints.
            </p>
            <CodeBlock code={`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`} lang="http" />
          </section>

          {/* Auth endpoints */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Authentication Endpoints</h2>
              <p className="text-sm text-muted-foreground mt-1">OTP-based phone authentication flow.</p>
            </div>
            <div className="space-y-3">
              {authSection.map((ep) => (
                <EndpointCard key={ep.path} {...ep} />
              ))}
            </div>
          </section>

          {/* Vendor endpoints */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Vendor Endpoints</h2>
              <p className="text-sm text-muted-foreground mt-1">Create, retrieve, and manage vendor profiles and KYC documents.</p>
            </div>
            <div className="space-y-3">
              {vendorSection.map((ep) => (
                <EndpointCard key={ep.path} {...ep} />
              ))}
            </div>
          </section>

          {/* Error codes */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Error Codes</h2>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {[
                    { code: "200", meaning: "Success" },
                    { code: "400", meaning: "Bad request — missing or invalid parameters" },
                    { code: "401", meaning: "Unauthorized — invalid or expired token" },
                    { code: "404", meaning: "Resource not found" },
                    { code: "429", meaning: "Rate limit exceeded" },
                    { code: "500", meaning: "Internal server error" },
                  ].map((row) => (
                    <tr key={row.code}>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{row.code}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{row.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-lg border border-border bg-card p-8 text-center shadow-xs">
            <h2 className="text-xl font-semibold text-foreground">Ready to integrate?</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Sign up for a free account to get your sandbox API key and start testing.
            </p>
            <div className="mt-5 flex justify-center gap-3 flex-wrap">
              <Button size="lg" className="h-10 px-5" asChild>
                <a href="/login">Get API Key</a>
              </Button>
              <Button size="lg" variant="outline" className="h-10 px-5" asChild>
                <a href="/login">View Dashboard</a>
              </Button>
            </div>
          </section>

        </div>
      </div>
    </PublicLayout>
  );
}
