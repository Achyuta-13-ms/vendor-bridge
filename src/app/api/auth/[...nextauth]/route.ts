import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          throw new Error("Email and OTP are required");
        }

        const session = await prisma.otpSession.findUnique({
          where: { identifier: credentials.email }
        });

        if (!session) {
          throw new Error("No OTP request found. Please request a new one.");
        }

        if (session.isUsed) {
          throw new Error("This OTP has already been used.");
        }

        if (session.expiresAt < new Date()) {
          throw new Error("OTP expired. Please request a new one.");
        }

        if (session.attempts >= 5) {
          throw new Error("Too many attempts. Please request a new OTP.");
        }

        // Verify OTP hash
        const isValid = await bcrypt.compare(credentials.otp, session.code);

        // Increment attempt
        await prisma.otpSession.update({
          where: { id: session.id },
          data: { 
            attempts: { increment: 1 },
            lastAttemptAt: new Date()
          }
        });

        if (!isValid) {
          throw new Error("Invalid verification code.");
        }

        // Mark as used
        await prisma.otpSession.update({
          where: { id: session.id },
          data: { isUsed: true }
        });

        // Upsert user
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              role: "VENDOR"
            }
          });
        }

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "VENDOR";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
