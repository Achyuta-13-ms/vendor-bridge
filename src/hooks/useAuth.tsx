"use client";

import { useSession, signOut as nextAuthSignOut, signIn as nextAuthSignIn } from "next-auth/react";
import { createContext, useContext, ReactNode } from "react";
import axios from "axios";

export interface User {
  id: string;
  email: string;
  role?: string;
  user_metadata?: { full_name?: string };
}

export interface Session { user: User; }

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  // Keeping these signature compatible but unimplemented for backwards compatibility in other parts of the app
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOtp: (email: string) => Promise<{ error: any }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: sessionData, status } = useSession();
  const loading = status === "loading";

  const user = sessionData?.user ? (sessionData.user as User) : null;
  const session = (sessionData && user) ? { user: user as User } : null;

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: "/login" });
  };

  const signUp = async () => ({ error: new Error("Not implemented") });
  const signIn = async () => ({ error: new Error("Not implemented") });
  const signInWithOtp = async () => ({ error: new Error("Not implemented") });
  const verifyOtp = async (email: string, otp: string) => {
    try {
      // 1. Verify via the dedicated API route as requested
      const res = await axios.post("/api/auth/verify-otp", { email, otp });
      
      if (res.data.success) {
        // 2. Establish a NextAuth session using the credentials provider
        const signInResult = await nextAuthSignIn("credentials", {
          email,
          otp,
          redirect: false,
        });

        if (signInResult?.error) {
          return { error: new Error(signInResult.error) };
        }

        // 3. (Legacy localStorage sync removed)
        const userData = res.data.user;
        
        return { success: true, user: userData, error: null };
      }
      return { error: new Error(res.data.message || "Verification failed") };
    } catch (error: any) {
      return { error: new Error(error.response?.data?.message || error.message || "Verification failed") };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
