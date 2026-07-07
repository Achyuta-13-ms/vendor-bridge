"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Fingerprint, 
  Files, 
  ShieldCheck, 
  GitPullRequest, 
  Network, 
  Activity, 
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Business Identity", href: "/dashboard/identity", icon: Fingerprint },
  { label: "Documents", href: "/dashboard/documents", icon: Files },
  { label: "Compliance", href: "/dashboard/compliance", icon: ShieldCheck },
  { label: "Verification Requests", href: "/dashboard/requests", icon: GitPullRequest },
  { label: "Connected Orgs", href: "/dashboard/organizations", icon: Network },
  { label: "Activity", href: "/dashboard/activity", icon: Activity },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-zinc-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 shadow-sm flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-lg text-black tracking-tight">VyapaarSetu</span>
        </Link>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-1">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 px-2 mt-4">Main Menu</div>
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all ${
                isActive 
                  ? "bg-orange-50 text-orange-600 font-bold" 
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-orange-500" : "text-zinc-400"}`} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-200">
        <Link href="/login">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer">
            <LogOut className="w-5 h-5 text-zinc-400" />
            Sign Out
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-zinc-200 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 bg-white border-r border-zinc-200 z-50 flex flex-col md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-64">
        
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-zinc-200 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-zinc-500 hover:text-black" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 w-64 bg-zinc-50 border border-zinc-200 rounded-[12px] text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-zinc-200 mx-2" />
            <button className="flex items-center gap-2 hover:bg-zinc-50 p-1 pr-3 rounded-[12px] transition-colors border border-transparent hover:border-zinc-200">
              <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-sm font-semibold text-black hidden sm:block">Acme Corp</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

    </div>
  );
}
