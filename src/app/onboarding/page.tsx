"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, UploadCloud, FileText, Upload, ChevronLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { signIn } from "next-auth/react";
import Link from "next/link";

const onboardingSchema = z.object({
  // Step 1
  businessName: z.string().min(2, "Business name is required"),
  workEmail: z.string().email("Valid email required"),
  mobile: z.string().min(10, "Valid mobile required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val, "You must accept the terms"),
  
  // Step 2 (OTP handled implicitly or via simple state, but we can track it here if we want)
  otp: z.string().optional(),

  // Step 3
  legalBusinessName: z.string().optional(),
  businessType: z.string().optional(),
  industry: z.string().optional(),
  gst: z.string().optional(),
  pan: z.string().optional(),
  cin: z.string().optional(),
  website: z.string().optional(),
  businessSize: z.string().optional(),

  // Step 4
  address: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pin: z.string().optional(),
  country: z.string().default("India"),
  
  // Step 5 (Documents handled via separate state usually, but we track generic strings for simplicity)
  gstDoc: z.string().optional(),
  panDoc: z.string().optional(),
  incDoc: z.string().optional(),
  chequeDoc: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword || !data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const STEPS = [
  "Create Account",
  "Verify Contact",
  "Business Information",
  "Business Address",
  "Upload Documents",
  "Review & Submit"
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [mounted, setMounted] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      country: "India"
    }
  });

  const formValues = watch();

  // Load saved state
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("vypaar_onboarding_draft");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.step) setCurrentStep(parsed.step);
      Object.keys(parsed.data || {}).forEach((key) => {
        setValue(key as keyof OnboardingData, parsed.data[key]);
      });
    }
  }, [setValue]);

  // Auto-save state
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("vypaar_onboarding_draft", JSON.stringify({
        step: currentStep,
        data: formValues
      }));
    }
  }, [formValues, currentStep, mounted]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const { toast } = useToast();

  const onSubmit = async (data: OnboardingData) => {
    setIsSubmitting(true);
    setOtpError("");
    try {
      if (currentStep === 1) {
        // Step 1 -> Send OTP
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.workEmail }),
        });
        const result = await res.json();
        if (result.success) {
          toast({ title: "OTP Sent", description: "Check your email (or server console) for the OTP." });
          setOtpSent(true);
          nextStep();
        } else {
          toast({ title: "Failed to send OTP", description: result.message, variant: "destructive" });
        }
      } else if (currentStep === 2) {
        // Step 2 -> Verify OTP
        if (!data.otp || data.otp.length < 6) {
          setOtpError("Please enter a valid 6-digit OTP");
          setIsSubmitting(false);
          return;
        }
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.workEmail, otp: data.otp, password: data.password }),
        });
        const result = await res.json();
        if (result.success) {
          // Log the user in to establish the session for subsequent API calls
          const signInResult = await signIn("credentials", {
            redirect: false,
            email: data.workEmail,
            password: data.password,
          });

          if (signInResult?.error) {
            setOtpError("Authentication failed: " + signInResult.error + ". If you already have an account, please use your existing password or reset it.");
            setIsSubmitting(false);
            return;
          }
          toast({ title: "Email Verified", description: "Your email has been successfully verified." });
          nextStep();
        } else {
          setOtpError(result.message || "Invalid OTP");
        }
      } else if (currentStep < 6) {
        nextStep();
      } else {
        // Final Submit
        const payload = {
          ...data,
          email: data.workEmail,
          gstUrl: data.gstDoc,
          panUrl: data.panDoc,
          bankUrl: data.chequeDoc,
          incUrl: data.incDoc,
        };
        const submitRes = await fetch("/api/onboarding/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const submitResult = await submitRes.json();
        
        if (!submitResult.success) {
          throw new Error(submitResult.message || "Failed to submit application");
        }

        localStorage.removeItem("vypaar_onboarding_draft");
        router.push("/onboarding/success");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center pt-16 pb-24 px-4 font-sans">
      
      {/* Brand & Progress Header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 shadow-sm flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg text-black tracking-tight">VyapaarSetu</span>
          </Link>
          <div className="text-sm font-semibold tracking-widest uppercase text-zinc-500">
            Step {currentStep} of 6
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 6) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        
        {currentStep > 1 && (
          <div className="px-8 pt-8 pb-0">
            <button onClick={prevStep} className="flex items-center text-sm font-semibold text-zinc-500 hover:text-black transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </button>
          </div>
        )}

        <div className="p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">{STEPS[currentStep - 1]}</h2>
          <p className="text-zinc-500 mb-8">
            {currentStep === 1 && "Start by creating your administrative account."}
            {currentStep === 2 && "We've sent a 6-digit code to your email and mobile."}
            {currentStep === 3 && "Tell us about your legal business entity."}
            {currentStep === 4 && "Where is your business registered?"}
            {currentStep === 5 && "Upload required verification documents."}
            {currentStep === 6 && "Please review your details before submitting."}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* STEP 1: Create Account */}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-black mb-1.5">Business Name</label>
                  <input {...register("businessName")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" placeholder="Acme Corp" />
                  {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">Work Email</label>
                    <input {...register("workEmail")} type="email" className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" placeholder="founder@acme.com" />
                    {errors.workEmail && <p className="text-red-500 text-xs mt-1">{errors.workEmail.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">Mobile Number</label>
                    <input {...register("mobile")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" placeholder="+91 98765 43210" />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">Password</label>
                    <input {...register("password")} type="password" className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" placeholder="••••••••" />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">Confirm Password</label>
                    <input {...register("confirmPassword")} type="password" className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" placeholder="••••••••" />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                </div>
                <div className="pt-2 flex items-start gap-3">
                  <input type="checkbox" {...register("termsAccepted")} id="terms" className="mt-1 w-4 h-4 rounded border-zinc-300 text-orange-600 focus:ring-orange-500" />
                  <label htmlFor="terms" className="text-sm text-zinc-600 leading-tight">
                    I agree to the Terms of Service and Privacy Policy. I understand that my business identity will be verified against government databases.
                  </label>
                </div>
                {errors.termsAccepted && <p className="text-red-500 text-xs mt-1">{errors.termsAccepted.message}</p>}
              </motion.div>
            )}

            {/* STEP 2: Verify Contact */}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center">
                <p className="text-black font-medium">Sent to: {formValues.workEmail}</p>
                <div className="flex flex-col items-center justify-center gap-3 my-8">
                  <input {...register("otp")} type="text" maxLength={6} placeholder="Enter 6-digit OTP" className="w-48 h-14 text-center text-xl font-bold tracking-[0.2em] rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                  {otpError && <p className="text-red-500 text-sm font-semibold">{otpError}</p>}
                </div>
                <div className="flex flex-col gap-3 justify-center items-center">
                  <button type="button" onClick={() => onSubmit(formValues)} className="text-sm font-bold text-orange-500 hover:text-orange-600">Resend OTP</button>
                  <button type="button" onClick={prevStep} className="text-sm font-bold text-zinc-500 hover:text-black">Change Email / Mobile</button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Business Information */}
            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-black mb-1.5">Legal Business Name</label>
                  <input {...register("legalBusinessName")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" placeholder="As registered on PAN" />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">Business Type</label>
                    <select {...register("businessType")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all bg-white">
                      <option value="">Select Type</option>
                      <option value="pvt_ltd">Private Limited</option>
                      <option value="llp">LLP</option>
                      <option value="proprietorship">Proprietorship</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">Industry</label>
                    <select {...register("industry")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all bg-white">
                      <option value="">Select Industry</option>
                      <option value="software">Software / IT</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="retail">Retail / E-commerce</option>
                      <option value="services">Services</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">GST Number</label>
                    <input {...register("gst")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 outline-none uppercase" placeholder="22AAAAA0000A1Z5" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">PAN Number</label>
                    <input {...register("pan")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 outline-none uppercase" placeholder="ABCDE1234F" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">CIN (Optional)</label>
                    <input {...register("cin")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 outline-none uppercase" placeholder="L12345MH2000PLC123456" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">Website (Optional)</label>
                    <input {...register("website")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 outline-none" placeholder="https://acme.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-3">Business Size</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Micro", "Small", "Medium", "Large"].map((size) => (
                      <label key={size} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${formValues.businessSize === size ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
                        <input type="radio" value={size} {...register("businessSize")} className="sr-only" />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Business Address */}
            {currentStep === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-black mb-1.5">Registered Address</label>
                  <input {...register("address")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" placeholder="123 Business Park, Block A" />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">City</label>
                    <input {...register("city")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">State</label>
                    <select {...register("state")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all bg-white">
                      <option value="">Select State</option>
                      <option value="MH">Maharashtra</option>
                      <option value="KA">Karnataka</option>
                      <option value="DL">Delhi</option>
                      <option value="TN">Tamil Nadu</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">PIN Code</label>
                    <input {...register("pin")} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" placeholder="400001" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">Country</label>
                    <input {...register("country")} disabled className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 outline-none" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Upload Documents */}
            {currentStep === 5 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {[
                  { id: "gstDoc", label: "GST Certificate", required: true },
                  { id: "panDoc", label: "PAN Card", required: true },
                  { id: "incDoc", label: "Certificate of Incorporation", required: false },
                  { id: "chequeDoc", label: "Cancelled Cheque", required: true },
                ].map((doc) => {
                  const currentValue = watch(doc.id as keyof OnboardingData);
                  return (
                    <div key={doc.id} className="border border-zinc-200 border-dashed rounded-xl p-5 flex flex-col justify-between hover:bg-zinc-50 transition-colors gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-orange-50">
                          <FileText className="w-5 h-5 text-zinc-400 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <div>
                          <p className="font-semibold text-black text-sm">{doc.label} {!doc.required && <span className="text-zinc-400 font-normal">(Optional)</span>}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">PDF, JPG or PNG (Max 5MB)</p>
                        </div>
                      </div>
                      
                      <FileUpload 
                        label={`Upload ${doc.label}`}
                        path={`onboarding/${formValues.workEmail?.replace(/[^a-zA-Z0-9]/g, '_')}`}
                        accept=".pdf,.png,.jpg,.jpeg"
                        initialUrl={currentValue as string}
                        onUpload={(url) => {
                          setValue(doc.id as keyof OnboardingData, url);
                        }}
                      />
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* STEP 6: Review & Submit */}
            {currentStep === 6 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                
                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-black text-lg">Account Details</h3>
                    <button type="button" onClick={() => setCurrentStep(1)} className="text-sm font-bold text-orange-500">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-zinc-500">Business Name</span><br/><span className="font-medium text-black">{formValues.businessName}</span></div>
                    <div><span className="text-zinc-500">Email</span><br/><span className="font-medium text-black">{formValues.workEmail}</span></div>
                    <div><span className="text-zinc-500">Mobile</span><br/><span className="font-medium text-black">{formValues.mobile}</span></div>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-black text-lg">Business Information</h3>
                    <button type="button" onClick={() => setCurrentStep(3)} className="text-sm font-bold text-orange-500">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-zinc-500">Legal Name</span><br/><span className="font-medium text-black">{formValues.legalBusinessName || "-"}</span></div>
                    <div><span className="text-zinc-500">GST</span><br/><span className="font-medium text-black">{formValues.gst || "-"}</span></div>
                    <div><span className="text-zinc-500">PAN</span><br/><span className="font-medium text-black">{formValues.pan || "-"}</span></div>
                    <div><span className="text-zinc-500">Type</span><br/><span className="font-medium text-black uppercase">{formValues.businessType || "-"}</span></div>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-black text-lg">Documents Uploaded</h3>
                    <button type="button" onClick={() => setCurrentStep(5)} className="text-sm font-bold text-orange-500">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-zinc-500">GST Certificate</span><br/><span className="font-medium text-black">{formValues.gstDoc ? "✓ Uploaded" : "-"}</span></div>
                    <div><span className="text-zinc-500">PAN Card</span><br/><span className="font-medium text-black">{formValues.panDoc ? "✓ Uploaded" : "-"}</span></div>
                    <div><span className="text-zinc-500">Incorporation Cert</span><br/><span className="font-medium text-black">{formValues.incDoc ? "✓ Uploaded" : "-"}</span></div>
                    <div><span className="text-zinc-500">Cancelled Cheque</span><br/><span className="font-medium text-black">{formValues.chequeDoc ? "✓ Uploaded" : "-"}</span></div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* Actions */}
            <div className="pt-6 border-t border-zinc-100 mt-8">
              <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto h-12 px-8 text-base">
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</>
                ) : (
                  <>
                    {currentStep === 1 && "Continue"}
                    {currentStep === 2 && "Verify & Continue"}
                    {currentStep > 2 && currentStep < 6 && "Continue"}
                    {currentStep === 6 && "Submit for Verification"}
                  </>
                )}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
