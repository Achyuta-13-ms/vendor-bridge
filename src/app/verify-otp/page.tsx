"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    // In a real app we'd fetch the pending email from context or local storage
    const pendingEmail = localStorage.getItem("pendingSignupEmail") || "hello@company.com";
    setEmail(pendingEmail);
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (value: string) => {
    if (value.length < 6) return;
    
    setLoading(true);
    try {
      // Mock verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Verified Successfully",
        description: "Let's set up your Business Profile.",
      });
      router.push("/onboarding");
    } catch (e) {
      toast({
        title: "Verification Failed",
        description: "Invalid or expired code.",
        variant: "destructive",
      });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCooldown(30);
    toast({
      title: "Code Resent",
      description: `We've sent a new 6-digit code to ${email}.`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="max-w-[440px] w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
              <span className="text-white font-bold text-sm">VS</span>
            </div>
            <span className="font-extrabold text-xl text-black tracking-tight">VyapaarSetu</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-black mb-2">Verify your email</h1>
          <p className="text-zinc-500">We sent a verification code to <br/><span className="font-semibold text-black">{email}</span></p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.04)] p-8">
          <div className="flex flex-col items-center space-y-8">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-orange-500" />
            </div>

            <div className="w-full flex justify-center">
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={(val) => {
                  setOtp(val);
                  if (val.length === 6) handleVerify(val);
                }}
                disabled={loading}
                autoFocus
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="h-14 w-12 rounded-xl border-2 border-zinc-200 text-lg font-bold text-black" />
                  <InputOTPSlot index={1} className="h-14 w-12 rounded-xl border-2 border-zinc-200 text-lg font-bold text-black" />
                  <InputOTPSlot index={2} className="h-14 w-12 rounded-xl border-2 border-zinc-200 text-lg font-bold text-black" />
                </InputOTPGroup>
                <InputOTPSeparator className="text-zinc-300" />
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={3} className="h-14 w-12 rounded-xl border-2 border-zinc-200 text-lg font-bold text-black" />
                  <InputOTPSlot index={4} className="h-14 w-12 rounded-xl border-2 border-zinc-200 text-lg font-bold text-black" />
                  <InputOTPSlot index={5} className="h-14 w-12 rounded-xl border-2 border-zinc-200 text-lg font-bold text-black" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              onClick={() => handleVerify(otp)}
              disabled={loading || otp.length < 6} 
              className="w-full h-14 text-lg bg-black text-white hover:bg-black/90 font-bold rounded-xl shadow-md transition-all"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Continue"}
            </Button>

            <div className="flex flex-col items-center gap-4 w-full">
              <Button
                variant="outline"
                className="w-full h-12 text-sm font-semibold rounded-xl border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-50"
                onClick={handleResend}
                disabled={loading || cooldown > 0}
              >
                {cooldown > 0 ? (
                  `Resend code in ${cooldown}s`
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" /> Resend OTP
                  </span>
                )}
              </Button>

              <button
                onClick={() => router.push("/signup")}
                className="text-sm font-semibold text-zinc-500 hover:text-black transition-colors underline underline-offset-4"
                disabled={loading}
              >
                Change email address
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
