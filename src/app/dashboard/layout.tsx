import { DashboardSidebar } from "@/components/dashboard-sidebar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-muted/20">
        <DashboardSidebar />
        
        <main className="flex-1 w-full relative flex flex-col h-screen overflow-y-auto">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg tracking-tight">VyapaarSetu</span>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <DashboardSidebar isMobile />
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="flex-1 mx-auto max-w-7xl w-full">
            {children}
          </div>
          
          {/* Professional Footer */}
          <footer className="py-6 px-4 md:px-8 border-t mt-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <ShieldCheck className="h-4 w-4" />
                <span>Secured with 256-bit encryption</span>
              </div>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} VyapaarSetu. All rights reserved.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </ProtectedRoute>
  );
}
