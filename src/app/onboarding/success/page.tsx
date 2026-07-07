"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-[400px] w-full text-center">
        
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.1 
          }}
          className="mx-auto w-24 h-24 bg-black rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-black/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-extrabold text-black mb-4 tracking-tight">
            Business Identity<br/>Created Successfully
          </h1>
          <p className="text-zinc-500 mb-10 leading-relaxed max-w-sm mx-auto">
            Your identity has been verified and registered on the VyapaarSetu network. You can now securely share it with partners.
          </p>

          <Link href="/dashboard" className="inline-block w-full">
            <Button className="w-full h-14 text-lg bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
        
      </div>
    </div>
  );
}
