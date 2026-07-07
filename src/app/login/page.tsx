"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid work email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      // Mock login for UI redesign
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Login Successful",
      });
      router.push("/dashboard");
    } catch (e: any) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials.",
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
          <h1 className="text-3xl font-extrabold tracking-tight text-black mb-2">Welcome Back</h1>
          <p className="text-zinc-500">Log in to manage your Business Identity.</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.04)] p-8">
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-black font-semibold">Password</FormLabel>
                      <Link href="/forgot-password" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input className="h-12 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-black focus:ring-black rounded-xl" type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="w-full h-14 mt-4 text-lg bg-black text-white hover:bg-black/90 font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Log In"}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Don't have a Business Identity?{" "}
          <Link href="/signup" className="font-bold text-black hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
