"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10">
        
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mx-auto w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6"
          >
            <Clock className="w-8 h-8 text-black" />
          </motion.div>

          <h1 className="text-2xl font-bold text-black mb-2">
            Verification Started
          </h1>
          <p className="text-zinc-500 mb-6 text-sm leading-relaxed">
            We're verifying your business identity.<br/>
            Estimated time: <span className="font-semibold text-black">24–48 Hours</span>
          </p>
        </div>

        {/* Timeline */}
        <div className="relative pl-4 space-y-6 mb-10">
          <div className="absolute left-[23px] top-2 bottom-2 w-px bg-zinc-200" />
          
          <div className="relative flex items-start gap-4">
            <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0 z-10 mt-0.5">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <span className="text-sm font-semibold text-black">Account Created</span>
          </div>

          <div className="relative flex items-start gap-4">
            <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0 z-10 mt-0.5">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <span className="text-sm font-semibold text-black">Profile Completed</span>
          </div>

          <div className="relative flex items-start gap-4">
            <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-white flex items-center justify-center shrink-0 z-10 mt-0.5 shadow-[0_0_0_4px_#FFF7ED]">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            </div>
            <div>
              <span className="text-sm font-bold text-orange-600 block">Verification in Progress</span>
              <span className="text-xs text-zinc-500">Checking against gov databases</span>
            </div>
          </div>

          <div className="relative flex items-start gap-4 opacity-50">
            <div className="w-5 h-5 rounded-full border-2 border-zinc-300 bg-white flex items-center justify-center shrink-0 z-10 mt-0.5" />
            <span className="text-sm font-medium text-zinc-500">Business Identity Generation</span>
          </div>

          <div className="relative flex items-start gap-4 opacity-50">
            <div className="w-5 h-5 rounded-full border-2 border-zinc-300 bg-white flex items-center justify-center shrink-0 z-10 mt-0.5" />
            <span className="text-sm font-medium text-zinc-500">Completed</span>
          </div>
        </div>
        
        <Link href="/dashboard" className="inline-block w-full">
          <Button className="w-full">
            Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        
      </div>
    </div>
  );
}
