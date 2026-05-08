"use client";

import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { createContext, useContext, ReactNode } from "react";

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
  const verifyOtp = async () => ({ error: new Error("Not implemented") });

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
