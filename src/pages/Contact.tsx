import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
  }),
};

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
      <section className="bg-gradient-hero py-20">
        <div className="container text-center">
          <motion.h1
            initial="hidden" animate="visible" custom={0} variants={fadeUp}
            className="text-4xl font-extrabold text-foreground md:text-5xl"
          >
            Get in <span className="text-gradient-primary">Touch</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" custom={1} variants={fadeUp}
            className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Have questions about VendorFlow? Our team is here to help.
          </motion.p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-12 md:grid-cols-2 max-w-4xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            custom={0} variants={fadeUp}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <p className="text-sm text-muted-foreground">hello@vendorflow.in</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Phone</h3>
                  <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Office</h3>
                  <p className="text-sm text-muted-foreground">
                    Bengaluru, Karnataka, India
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            custom={1} variants={fadeUp}
          >
            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input placeholder="Your name" required className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input type="email" placeholder="you@company.com" required className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Message</label>
                <Textarea placeholder="Tell us about your needs..." rows={4} required className="mt-1" />
              </div>
              <Button variant="hero" className="w-full gap-2" disabled={loading}>
                <Send className="h-4 w-4" /> {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;
