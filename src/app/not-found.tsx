import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 text-center">
        
        <h1 className="text-6xl font-extrabold text-orange-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-black mb-2">Page Not Found</h2>
        <p className="text-zinc-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link href="/">
          <Button size="lg" className="w-full">
            Return to Home
          </Button>
        </Link>
        
      </div>
    </div>
  );
}
