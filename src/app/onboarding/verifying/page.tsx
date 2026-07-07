"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Check, Loader2 } from "lucide-react";

const TIMELINE = [
  { id: 1, text: "Documents Submitted" },
  { id: 2, text: "Verification Started" },
  { id: 3, text: "Identity Generation" },
  { id: 4, text: "Completed" },
];

export default function VerifyingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Sequence the timeline progress
    const timings = [1500, 3000, 5000, 6500];
    
    timings.forEach((time, index) => {
      setTimeout(() => {
        setCurrentStep(index + 1);
      }, time);
    });

    // Navigate to success after completion
    setTimeout(() => {
      router.push("/onboarding/success");
    }, 7500);
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.04)] p-10 text-center">
        
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center relative"
          >
            <ShieldCheck className="w-10 h-10 text-orange-500" />
            
            {/* Ping animation effect */}
            <span className="absolute inset-0 rounded-2xl ring-4 ring-orange-500/20 animate-ping" />
          </motion.div>
        </div>

        <h1 className="text-2xl font-extrabold text-black mb-2">Verifying Identity</h1>
        <p className="text-zinc-500 mb-10 text-sm leading-relaxed">
          Your Business Identity is being verified securely. Please do not close this page.
        </p>

        <div className="relative text-left max-w-[240px] mx-auto space-y-8">
          {/* Vertical progress line background */}
          <div className="absolute left-[11px] top-[14px] bottom-[14px] w-0.5 bg-zinc-100" />
          
          {/* Active progress line */}
          <motion.div 
            className="absolute left-[11px] top-[14px] w-0.5 bg-black"
            initial={{ height: "0%" }}
            animate={{ height: `${(currentStep / (TIMELINE.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />

          {TIMELINE.map((step, index) => {
            const isCompleted = currentStep > index;
            const isCurrent = currentStep === index;
            
            return (
              <div key={step.id} className="relative flex items-center gap-6">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-500
                    ${isCompleted ? "bg-black text-white" : isCurrent ? "bg-white border-2 border-black" : "bg-zinc-100"}
                  `}
                >
                  {isCompleted && <Check className="w-3.5 h-3.5" />}
                  {isCurrent && <div className="w-2 h-2 rounded-full bg-black animate-pulse" />}
                </div>
                
                <motion.span 
                  className={`font-semibold text-sm transition-colors duration-500
                    ${isCompleted ? "text-black" : isCurrent ? "text-black" : "text-zinc-400"}
                  `}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  {step.text}
                </motion.span>
                
                {isCurrent && (
                  <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin absolute right-0" />
                )}
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
}
