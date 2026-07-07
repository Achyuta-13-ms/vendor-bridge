"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const signupSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  email: z.string().email("Please enter a valid work email"),
  mobile: z.string().min(10, "Valid mobile number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, "You must agree to the Terms & Privacy Policy")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      businessName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (values: SignupFormValues) => {
    setLoading(true);
    try {
      // In a real implementation, we would call an API here to create the account.
      // We will mock this API call for the redesign.
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store email temporarily for OTP verification
      localStorage.setItem("pendingSignupEmail", values.email);

      toast({
        title: "Account Created",
        description: "Please verify your email to continue.",
      });
      router.push("/verify-otp");
    } catch (e: any) {
      toast({
        title: "Signup Failed",
        description: e?.message || "Failed to create account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left side: Form */}
      <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-12">
        <Link href="/" className="mb-12 inline-block">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
              <span className="text-white font-bold text-sm">VS</span>
            </div>
            <span className="font-extrabold text-xl text-black tracking-tight">VyapaarSetu</span>
          </div>
        </Link>

        <div className="max-w-md w-full">
          <h1 className="text-3xl font-extrabold tracking-tight text-black mb-2">Create Business Identity</h1>
          <p className="text-zinc-500 mb-8">Join the trusted infrastructure for modern digital commerce.</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-semibold">Business Name</FormLabel>
                    <FormControl>
                      <Input className="h-12 bg-white border-zinc-200 focus:border-black focus:ring-black rounded-lg" placeholder="Acme Corp Ltd." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-semibold">Work Email</FormLabel>
                      <FormControl>
                        <Input className="h-12 bg-white border-zinc-200 focus:border-black focus:ring-black rounded-lg" type="email" placeholder="name@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-semibold">Mobile Number</FormLabel>
                      <FormControl>
                        <Input className="h-12 bg-white border-zinc-200 focus:border-black focus:ring-black rounded-lg" type="tel" placeholder="+91 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-semibold">Password</FormLabel>
                      <FormControl>
                        <Input className="h-12 bg-white border-zinc-200 focus:border-black focus:ring-black rounded-lg" type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-semibold">Confirm Password</FormLabel>
                      <FormControl>
                        <Input className="h-12 bg-white border-zinc-200 focus:border-black focus:ring-black rounded-lg" type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-zinc-300 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium text-zinc-600">
                        I agree to the Terms & Privacy Policy
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="w-full h-14 text-lg bg-black text-white hover:bg-black/90 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Already have a Business Identity?{" "}
            <Link href="/login" className="font-bold text-black hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Right side: Visuals */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-zinc-50 border-l border-zinc-100 p-12 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-[600px] h-[600px] bg-orange-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 max-w-md w-full bg-white border border-zinc-200 rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.06)] p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-black text-lg">Bank-grade Security</h3>
              <p className="text-sm text-zinc-500">SOC2 Type II Certified</p>
            </div>
          </div>
          <div className="space-y-6">
             <div className="flex items-start gap-4">
               <div className="mt-1 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
               </div>
               <div>
                 <p className="font-semibold text-black">End-to-End Encryption</p>
                 <p className="text-sm text-zinc-500">Your documents are encrypted at rest and in transit.</p>
               </div>
             </div>
             <div className="flex items-start gap-4">
               <div className="mt-1 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
               </div>
               <div>
                 <p className="font-semibold text-black">Granular Consent</p>
                 <p className="text-sm text-zinc-500">You control exactly which enterprises can access your identity.</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
