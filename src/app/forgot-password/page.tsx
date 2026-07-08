"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid work email"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ResetFormValues) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/forgot-password", { email: values.email });
      if (res.data.success) {
        setSubmitted(true);
      } else {
        throw new Error(res.data.message);
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.response?.data?.message || e.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="max-w-[400px] w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
              <span className="text-white font-bold text-sm">VS</span>
            </div>
            <span className="font-extrabold text-xl text-black tracking-tight">VyapaarSetu</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-black mb-2">Reset Password</h1>
          <p className="text-zinc-500">We'll send you a link to reset your password.</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.04)] p-8">
          {submitted ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-black mb-2">Check your email</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  We've sent a password reset link to <br/>
                  <span className="font-semibold text-black">{form.getValues("email")}</span>
                </p>
              </div>
              <Link href="/login" className="block w-full">
                <Button className="w-full h-12 text-black bg-zinc-100 hover:bg-zinc-200 font-bold rounded-xl shadow-none">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-semibold">Work Email</FormLabel>
                      <FormControl>
                        <Input className="h-12 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-black focus:ring-black rounded-xl" type="email" placeholder="name@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading} className="w-full h-14 mt-4 text-lg bg-black text-white hover:bg-black/90 font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
                </Button>
                
                <div className="pt-4 text-center">
                  <Link href="/login" className="inline-flex items-center text-sm font-semibold text-zinc-500 hover:text-black transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
