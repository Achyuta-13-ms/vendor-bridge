import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <PublicLayout>
      <section className="border-b border-border py-16">
        <div className="container text-center">
          <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
            Get in <span className="text-primary">touch</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            Have questions about VendorFlow? Our team is here to help.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-10 md:grid-cols-2 max-w-3xl mx-auto">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-5">Contact Information</h2>
            <div className="space-y-5">
              {[
                { icon: Mail, label: "Email", value: "hello@vendorflow.in" },
                { icon: Phone, label: "Phone", value: "+91 98765 43210" },
                { icon: MapPin, label: "Office", value: "Bengaluru, Karnataka, India" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 border border-primary/10 shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{item.label}</h3>
                    <p className="text-xs text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div>
              <label className="text-xs font-medium text-foreground">Name</label>
              <Input placeholder="Your name" required className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Email</label>
              <Input type="email" placeholder="you@company.com" required className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Message</label>
              <Textarea placeholder="Tell us about your needs..." rows={4} required className="mt-1" />
            </div>
            <Button className="w-full gap-2" disabled={loading}>
              <Send className="h-4 w-4" /> {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;
