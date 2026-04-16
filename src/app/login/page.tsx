"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ShieldCheck, RefreshCw, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Check if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Cooldown timer logic
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const mapError = (error: any) => {
    const message = error?.message || "";
    if (message.includes("Email rate limit exceeded")) {
      return "Too many attempts. Please wait a few minutes.";
    }
    if (message.includes("Token has expired or is invalid")) {
      return "Incorrect or expired code. Please try again.";
    }
    return "Something went wrong. Check your connection and retry.";
  };

  const handleSendOTP = async (isResend = false) => {
    if (!validateEmail(email)) {
      toast({ 
        title: "Invalid Email", 
        description: "Please enter a valid email address.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/send-otp", { email });
      setLoading(false);

      if (res.data.success) {
        if (res.data.mock) {
          toast({
            title: "Simulated Login",
            description: `Dev Mode — Verification code: ${res.data.otp}`,
          });
        } else {
          toast({
            title: isResend ? "Code Resent" : "OTP Sent!",
            description: `We've sent a 6-digit code to ${email}.`,
          });
        }
        setStep("otp");
        setCooldown(30);
      }
    } catch (e: any) {
      setLoading(false);
      toast({
        title: "Error",
        description: e?.response?.data?.message || "Failed to send code.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) return;

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/verify-otp", { email, otp });
      setLoading(false);

      if (res.data.success) {
        // Correct behavior: Persist the vendor session manually for simulation
        localStorage.setItem("vendorSession", JSON.stringify(res.data.user));
        
        toast({
          title: "Success!",
          description: "You have been successfully verified.",
        });
        
        router.push("/dashboard");
      }
    } catch (e: any) {
      setLoading(false);
      setOtp(""); // Clear OTP input on failure
      toast({
        title: "Verification Failed",
        description: e?.response?.data?.message || "Invalid or expired code.",
        variant: "destructive",
      });
    }
  };

  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");
    if (!name || !domain) return email;
    const maskedName = name[0] + "***";
    return `${maskedName}@${domain}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 font-sans">
      <div className="w-full max-w-md space-y-8">
        {/* Header & Step Indicator */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary"
          >
            <ShieldCheck className="h-8 w-8" />
          </motion.div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">VendorFlow</h1>
            <p className="text-muted-foreground text-sm font-medium">
              Secure Access • Step {step === "email" ? "1" : "2"} of 2
            </p>
          </div>

          {/* Simple Step Progress Bar */}
          <div className="flex justify-center gap-1.5 pt-2">
            <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === "email" ? "bg-primary" : "bg-primary/40"}`} />
            <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === "otp" ? "bg-primary" : "bg-muted-foreground/20"}`} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden border-t border-white/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              
              <CardHeader className="pt-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  {step === "email" ? (
                    <>
                      <Mail className="h-5 w-5 text-primary" />
                      Sign in with email
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Verification code
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  {step === "email"
                    ? "Enter your work email and we'll send you a secure login link."
                    : `We sent a 6-digit code to ${maskEmail(email)}`}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pb-8">
                {step === "email" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                          className="h-12 pl-11 bg-muted/50 border-muted focus:bg-background transition-all"
                          autoFocus
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleSendOTP()}
                      disabled={loading || !email}
                      className="w-full h-12 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Send Secure Code <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6 flex flex-col items-center">
                    <div className="w-full">
                      <InputOTP 
                        maxLength={6} 
                        value={otp} 
                        onChange={(val) => setOtp(val)}
                        onComplete={handleVerifyOTP}
                        autoFocus
                        disabled={loading}
                      >
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot index={0} className="h-12 w-12 rounded-lg border-2" />
                          <InputOTPSlot index={1} className="h-12 w-12 rounded-lg border-2" />
                          <InputOTPSlot index={2} className="h-12 w-12 rounded-lg border-2" />
                          <InputOTPSlot index={3} className="h-12 w-12 rounded-lg border-2" />
                          <InputOTPSlot index={4} className="h-12 w-12 rounded-lg border-2" />
                          <InputOTPSlot index={5} className="h-12 w-12 rounded-lg border-2" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <div className="w-full space-y-4 pt-2">
                      <Button
                        onClick={handleVerifyOTP}
                        disabled={loading || otp.length < 6}
                        className="w-full h-12 text-sm font-semibold shadow-lg shadow-primary/20"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Sign In"}
                      </Button>
                      
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Did not receive the code?
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-9 px-4 font-semibold border-muted hover:bg-muted/50"
                          onClick={() => handleSendOTP(true)}
                          disabled={loading || cooldown > 0}
                        >
                          {cooldown > 0 ? (
                            `Resend code in ${cooldown}s`
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <RefreshCw className="h-3 w-3" /> Resend OTP
                            </span>
                          )}
                        </Button>

                        <button
                          onClick={() => { setStep("email"); setOtp(""); }}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                          disabled={loading}
                        >
                          Change email address
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-sm text-muted-foreground font-medium">
          New to VendorFlow?{" "}
          <a href="/signup" className="text-primary font-bold hover:text-primary/80 transition-colors">
            Get started
          </a>
        </p>

        {/* Footer info */}
        <div className="text-center space-y-4 pt-4 border-t border-muted/50">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">
            Powered by Secure Auth Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}
