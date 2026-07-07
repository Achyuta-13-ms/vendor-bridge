"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, Users, FileText, CheckCircle, Activity, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnterpriseDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50">Loading...</div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-zinc-200 flex flex-col fixed h-full z-10">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center overflow-hidden">
              <span className="text-white font-bold text-xs">VS</span>
            </div>
            <span className="font-bold text-lg text-black tracking-tight">Enterprise</span>
          </div>
          
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-orange-50 text-orange-600 font-bold rounded-lg">
              <Activity className="w-5 h-5" /> Overview
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 font-medium rounded-lg">
              <Users className="w-5 h-5" /> Vendors
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 font-medium rounded-lg">
              <CheckCircle className="w-5 h-5" /> Verification Requests
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 font-medium rounded-lg">
              <FileText className="w-5 h-5" /> API Keys
            </a>
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-zinc-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-zinc-200"></div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{session.user?.email}</p>
              <p className="text-xs text-zinc-500">Enterprise Admin</p>
            </div>
          </div>
          <Button onClick={() => signOut({ callbackUrl: '/' })} variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-none shadow-none">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-2 w-96">
            <Search className="w-4 h-4 text-zinc-400" />
            <input type="text" placeholder="Search vendors or IDs..." className="w-full outline-none text-sm" />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-zinc-50 rounded-full relative">
              <Bell className="w-5 h-5 text-zinc-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-black mb-8">Enterprise Overview</h1>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <p className="text-zinc-500 text-sm font-medium mb-2">Total Verified Vendors</p>
                <p className="text-3xl font-bold text-black">1,248</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <p className="text-zinc-500 text-sm font-medium mb-2">Pending Verifications</p>
                <p className="text-3xl font-bold text-orange-500">42</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <p className="text-zinc-500 text-sm font-medium mb-2">API Requests (30d)</p>
                <p className="text-3xl font-bold text-black">84.2k</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
              <h2 className="font-bold text-black mb-6">Recent Verifications</h2>
              <div className="text-center py-12 text-zinc-500">
                <Activity className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                <p>No recent verification activity.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
