"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 text-center">
        
        <h1 className="text-xl font-bold text-black mb-2">Something went wrong!</h1>
        <p className="text-zinc-500 mb-8 text-sm">
          An unexpected error has occurred. We've been notified and are looking into it.
        </p>

        <Button onClick={() => reset()} size="lg" className="w-full">
          Try again
        </Button>
        
      </div>
    </div>
  );
}
