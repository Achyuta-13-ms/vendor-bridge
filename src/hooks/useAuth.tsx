"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  user_metadata?: { full_name?: string };
}
export interface Session { user: User; access_token: string; }

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOtp: (email: string) => Promise<{ error: any }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedSession = localStorage.getItem('vypaar_session');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setSession(parsed);
        setUser(parsed.user);
      } catch (e) {
        localStorage.removeItem('vypaar_session');
      }
    }
    setLoading(false);
  }, []);

  const setLocalSession = (newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    if (newSession) {
      localStorage.setItem('vypaar_session', JSON.stringify(newSession));
      // Polyfill backwards compat vendorSession for dashboard routing dependency
      localStorage.setItem('vendorSession', JSON.stringify({
        id: newSession.user.id,
        email: newSession.user.email
      }));
    } else {
      localStorage.removeItem('vypaar_session');
      localStorage.removeItem('vendorSession');
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Mock implementation for sign up
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    return { error: new Error("Password sign in is disabled. Please use OTP.") };
  };

  const signInWithOtp = async (email: string) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: token })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'OTP verification failed');
      }
      
      // ✅ USE REAL BACKEND RESPONSE
      setLocalSession({
        user: data.user,
        access_token: data.token
      });
      
      return { error: null };
      
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    setLocalSession(null);
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
