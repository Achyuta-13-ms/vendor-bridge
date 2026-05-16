"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Layers,
  Zap,
  TrendingUp,
  Package,
  ArrowLeftRight,
  Code2,
  Radio,
  Home,
  User as UserIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, active, collapsed }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
          active 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", active ? "text-primary-foreground" : "group-hover:text-primary")} />
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm font-medium whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
        {active && (
          <motion.div
            layoutId="active-pill"
            className="absolute left-0 w-1 h-6 bg-primary-foreground rounded-r-full"
          />
        )}
      </div>
    </Link>
  );
};

import { signOut, useSession } from "next-auth/react";

export function DashboardSidebar({ isMobile }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = React.useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Package, label: "Inventory", href: "/dashboard/inventory" },
    { icon: ArrowLeftRight, label: "Catalog Mapping", href: "/dashboard/mapping" },
    { icon: ShieldCheck, label: "Verifications", href: "/dashboard/kyc" },
  ];

  const bottomItems = [
    { icon: UserIcon, label: "My Profile", href: "/dashboard/profile" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isMobile ? "100%" : collapsed ? 80 : 260 }}
      className={cn(
        "flex flex-col h-screen bg-background border-r border-border/50 sticky top-0 overflow-hidden group/sidebar",
        !isMobile && "hidden md:flex"
      )}
    >
      <div className="px-4 py-6 flex items-center justify-between gap-2">
        <motion.div 
          className={cn(
            "flex items-center gap-2.5 min-w-0 overflow-hidden transition-all duration-300",
            collapsed && !isMobile ? "w-10 justify-center" : "flex-1"
          )}
        >
          <div className="h-9 w-9 bg-card rounded-xl flex items-center justify-center border border-border/50 shadow-green-glow overflow-hidden shrink-0">
            <img 
              src="/logo.png" 
              alt="VS" 
              className="h-full w-full object-cover" 
            />
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">VyapaarSetu</span>
          )}
        </motion.div>

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 hover:bg-muted shrink-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <div className="flex-1 px-4 py-2 space-y-8 overflow-y-auto no-scrollbar">
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href}
              collapsed={!isMobile && collapsed}
            />
          ))}
        </nav>

        <div className="pt-4 border-t border-border/50 space-y-1.5">
          {(!collapsed || isMobile) && (
            <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              System
            </p>
          )}
          {bottomItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href}
              collapsed={!isMobile && collapsed}
            />
          ))}
          
          <div className={cn(
            "flex items-center px-3 py-2 rounded-lg",
            collapsed && !isMobile ? "justify-center" : "justify-between"
          )}>
            {(!collapsed || isMobile) && (
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
            )}
            <ModeToggle />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border/50 bg-muted/30">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10",
            !isMobile && collapsed && "px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {(!collapsed || isMobile) && <span>Sign Out</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
