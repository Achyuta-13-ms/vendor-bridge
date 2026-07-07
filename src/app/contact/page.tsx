"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Mail, Phone, Linkedin, CheckCircle2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().min(2, "Company name is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
        
        {/* Info Side */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight mb-4">
              Get in touch
            </h1>
            <p className="text-xl text-zinc-500 leading-relaxed">
              Whether you're an enterprise looking to automate vendor verification, or a small business needing help with your identity setup, we're here to help.
            </p>
          </div>

          <div className="space-y-6 pt-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-bold text-black">Email</h4>
                <p className="text-zinc-600">hello@vyapaarsetu.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-black" />
              </div>
              <div>
                <h4 className="font-bold text-black">Phone</h4>
                <p className="text-zinc-600">+91 800-SETU-123</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              </div>
              <div>
                <h4 className="font-bold text-black">LinkedIn</h4>
                <p className="text-zinc-600">/company/vyapaarsetu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="bg-white border border-zinc-200 rounded-[24px] shadow-lg p-8 md:p-10">
          {success ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-black">Message Sent!</h3>
              <p className="text-zinc-500">We'll get back to you within 24 hours.</p>
              <Button onClick={() => setSuccess(false)} variant="outline" className="mt-8">Send another message</Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black">Full Name</FormLabel>
                      <FormControl><Input className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" placeholder="John Doe" disabled={loading} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="company" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black">Company</FormLabel>
                      <FormControl><Input className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" placeholder="Acme Corp" disabled={loading} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-black">Work Email</FormLabel>
                    <FormControl><Input className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" type="email" placeholder="john@acme.com" disabled={loading} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-black">Message</FormLabel>
                    <FormControl><Textarea className="min-h-[120px] bg-zinc-50 border-zinc-200 rounded-xl resize-none" placeholder="How can we help you?" disabled={loading} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-black/90 rounded-xl">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Message"}
                </Button>
              </form>
            </Form>
          )}
        </div>

      </div>
    </div>
  );
}
