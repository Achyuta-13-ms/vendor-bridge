"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import {
  Shield, Mail, ArrowRight, ArrowLeft,
  CheckCircle2, Building2, FileText,
  User as UserIcon, BadgeCheck, RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import PublicLayout from "@/components/layout/PublicLayout";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid business email"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  name: z.string().min(2, "Full name is required"),
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.string().min(1, "Please select a business type"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  documents: z.object({
    gst: z.string().min(1, "GST document is required"),
    pan: z.string().min(1, "PAN document is required"),
    bank: z.string().optional(),
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "Private Limited",
  "Public Limited",
  "LLP",
  "Individual Consultant",
];

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { verifyOtp: verifyOtpAuth } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      otp: "",
      name: "",
      businessName: "",
      businessType: "",
      description: "",
      address: "",
      city: "",
      documents: { gst: "", pan: "", bank: "" },
    },
    mode: "onChange",
  });

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["email"];
    if (step === 2) fieldsToValidate = ["otp"];
    if (step === 3) fieldsToValidate = ["name", "businessName", "businessType", "description"];
    if (step === 4) fieldsToValidate = ["address", "city"];
    if (step === 5) fieldsToValidate = ["documents.gst", "documents.pan"];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (step === 1) {
        handleSendOTP();
      } else {
        setStep((prev) => prev + 1);
      }
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const email = form.getValues("email");
      const res = await axios.post("/api/auth/send-otp", { email });
      if (res.data.success) {
        if (res.data.mock) {
          toast({
            title: "Dev Mode — Mock OTP",
            description: `Verification service is in mock mode. Use code: ${res.data.otp}`,
          });
        } else {
          toast({
            title: "Verification Code Sent",
            description: `Check ${email} for your 6-digit code.`,
          });
        }
        setStep(2);
      }
    } catch (e: any) {
      toast({
        title: "Failed to Send",
        description: e?.response?.data?.message || "Failed to send verification code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const email = form.getValues("email");
      const otp = form.getValues("otp");
      
      const { error } = await verifyOtpAuth(email, otp);
      
      if (!error) {
        setStep(3);
      } else {
        throw error;
      }
    } catch (e: any) {
      toast({
        title: "Invalid Code",
        description: e?.message || "The code is incorrect or has expired.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: SignupFormValues) => {
    setLoading(true);
    try {
      // Get the locally stored session for the userId
      const sessionStr = localStorage.getItem("vendorSession");
      let userId = form.getValues("email"); // fallback
      if (sessionStr) {
        try {
          const parsed = JSON.parse(sessionStr);
          if (parsed.id) userId = parsed.id;
        } catch (e) {}
      }

      const res = await axios.post("/api/vendor", {
        businessName: values.businessName,
        address: values.address,
        city: values.city,
        // The businessType and description could be passed but /api/vendor handles address mostly right now
        documents: values.documents,
        userId: userId,
      });
      if (res.data.success) {
        toast({ title: "Account Created!", description: "Your vendor profile is ready for review." });
        router.push("/dashboard");
      }
    } catch (e: any) {
      toast({
        title: "Signup Failed",
        description: e?.response?.data?.message || "Internal server error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 bg-muted/20">
        <div className="w-full max-w-xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2"
            >
              <Shield className="h-6 w-6" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground">Join the trusted infrastructure for vendor onboarding.</p>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-elevated overflow-hidden bg-card">
                  {/* Progress bar */}
                  <div className="h-1 bg-muted">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "16.6%" }}
                      animate={{ width: `${(step / 6) * 100}%` }}
                    />
                  </div>

                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl underline decoration-primary/30 decoration-4 underline-offset-4">
                      {step === 1 && "Business Email"}
                      {step === 2 && "Email Verification"}
                      {step === 3 && "Business Identity"}
                      {step === 4 && "Physical Presence"}
                      {step === 5 && "KYC Documents"}
                      {step === 6 && "Final Review"}
                    </CardTitle>
                    <CardDescription>
                      {step === 1 && "Enter your business email to get started."}
                      {step === 2 && `Enter the 6-digit code sent to ${form.getValues("email") || "your email"}.`}
                      {step === 3 && "Tell us about your organization."}
                      {step === 4 && "Where is your business located?"}
                      {step === 5 && "High-quality uploads ensure faster verification."}
                      {step === 6 && "Confirm your details before proceeding."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* STEP 1: EMAIL */}
                        {step === 1 && (
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Business Email</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        className="h-12 pl-10"
                                        type="email"
                                        placeholder="you@company.com"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button className="w-full h-12" onClick={nextStep} disabled={loading} type="button">
                              {loading ? "Sending..." : (
                                <span className="flex items-center gap-2">
                                  Send Verification Code <ArrowRight className="h-4 w-4" />
                                </span>
                              )}
                            </Button>
                          </div>
                        )}

                        {/* STEP 2: OTP */}
                        {step === 2 && (
                          <div className="space-y-6 flex flex-col items-center">
                            {/* Email chip */}
                            <div className="bg-muted/50 rounded-xl px-4 py-3 w-full text-center">
                              <p className="text-xs text-muted-foreground mb-0.5">Code sent to</p>
                              <p className="text-sm font-semibold text-primary">{form.getValues("email")}</p>
                            </div>

                            <FormField
                              control={form.control}
                              name="otp"
                              render={({ field }) => (
                                <FormItem className="flex flex-col items-center">
                                  <FormControl>
                                    <InputOTP maxLength={6} {...field}>
                                      <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                      </InputOTPGroup>
                                      <InputOTPSeparator />
                                      <InputOTPGroup>
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                      </InputOTPGroup>
                                    </InputOTP>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="w-full space-y-3 pt-2">
                              <Button
                                className="w-full h-12"
                                onClick={handleVerifyOTP}
                                disabled={loading}
                                type="button"
                              >
                                {loading ? "Verifying..." : "Verify & Continue"}
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-full text-sm text-muted-foreground"
                                onClick={() => { setStep(1); form.setValue("otp", ""); }}
                                disabled={loading}
                                type="button"
                              >
                                <RefreshCw className="h-3.5 w-3.5 mr-2" /> Change email or resend
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* STEP 3: BUSINESS INFO */}
                        {step === 3 && (
                          <div className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Full Name</FormLabel>
                                <FormControl><Input className="h-11" placeholder="Legal name" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="businessName" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Display Name</FormLabel>
                                <FormControl><Input className="h-11" placeholder="Public trading name" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="businessType" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {BUSINESS_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Brief Description</FormLabel>
                                <FormControl><Textarea className="resize-none" placeholder="What does your business do?" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <Button className="w-full h-11" onClick={nextStep} type="button">
                              Next: Location <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {/* STEP 4: LOCATION */}
                        {step === 4 && (
                          <div className="space-y-4">
                            <FormField control={form.control} name="address" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Registered Address</FormLabel>
                                <FormControl><Input className="h-11" placeholder="Plot No, Street, Area" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="city" render={({ field }) => (
                              <FormItem>
                                <FormLabel>City / State</FormLabel>
                                <FormControl><Input className="h-11" placeholder="e.g. Mumbai, Maharashtra" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <Button variant="outline" className="h-11" onClick={() => setStep(3)} type="button">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                              </Button>
                              <Button className="h-11" onClick={nextStep} type="button">
                                Next: Documents <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* STEP 5: DOCUMENTS */}
                        {step === 5 && (
                          <div className="space-y-6">
                            <FormField control={form.control} name="documents.gst" render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between mb-2">
                                  <FormLabel>GST Certificate</FormLabel>
                                  {field.value && <BadgeCheck className="h-5 w-5 text-emerald-500" />}
                                </div>
                                <FormControl>
                                  <FileUpload
                                    label="Upload GST"
                                    path={form.getValues("email").replace(/[.@]/g, "_")}
                                    initialUrl={field.value}
                                    onUpload={(url) => form.setValue("documents.gst", url, { shouldValidate: true })}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="documents.pan" render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between mb-2">
                                  <FormLabel>Company PAN</FormLabel>
                                  {field.value && <BadgeCheck className="h-5 w-5 text-emerald-500" />}
                                </div>
                                <FormControl>
                                  <FileUpload
                                    label="Upload PAN"
                                    path={form.getValues("email").replace(/[.@]/g, "_")}
                                    initialUrl={field.value}
                                    onUpload={(url) => form.setValue("documents.pan", url, { shouldValidate: true })}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="documents.bank" render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between mb-2">
                                  <FormLabel>Cancelled Cheque / Bank Statement (Optional)</FormLabel>
                                  {field.value && <BadgeCheck className="h-5 w-5 text-emerald-500" />}
                                </div>
                                <FormControl>
                                  <FileUpload
                                    label="Upload Bank Doc"
                                    path={form.getValues("email").replace(/[.@]/g, "_")}
                                    initialUrl={field.value}
                                    onUpload={(url) => form.setValue("documents.bank", url, { shouldValidate: true })}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <Button variant="outline" className="h-11" onClick={() => setStep(4)} type="button">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                              </Button>
                              <Button className="h-11" onClick={nextStep} type="button">
                                Review <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* STEP 6: REVIEW */}
                        {step === 6 && (
                          <div className="space-y-6">
                            <div className="rounded-2xl border bg-muted/30 p-5 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                  <UserIcon className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Admin</p>
                                  <p className="font-semibold">{form.getValues("name")}</p>
                                  <p className="text-xs text-muted-foreground">{form.getValues("email")}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                  <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Business</p>
                                  <p className="font-semibold">{form.getValues("businessName")}</p>
                                  <p className="text-xs text-muted-foreground">{form.getValues("businessType")}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                  <span className="text-xs">GST Uploaded</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                  <span className="text-xs">PAN Uploaded</span>
                                </div>
                                {form.getValues("documents.bank") && (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs">Bank Doc Uploaded</span>
                                  </div>
                                )}
                              </div>
                              <div className="border-t pt-4 space-y-1">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Location</p>
                                <p className="text-xs">{form.getValues("address")}, {form.getValues("city")}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <Button variant="outline" className="h-11" onClick={() => setStep(5)} disabled={loading} type="button">Back</Button>
                              <Button type="submit" className="h-11" disabled={loading}>
                                {loading ? "Creating Account..." : "Finalize & Signup"}
                              </Button>
                            </div>
                          </div>
                        )}

                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary font-bold hover:underline">Log in</a>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
