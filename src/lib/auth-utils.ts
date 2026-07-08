import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function verifyOTP(email: string, otp: string, password?: string, options: { skipUsedCheckWindow?: number } = {}) {
  const session = await prisma.otpSession.findUnique({
    where: { identifier: email }
  });

  if (!session) {
    throw new Error("No OTP request found. Please request a new one.");
  }

  const now = new Date();
  
  if (session.isUsed) {
    // Allow a small window (default 10s) for reuse if it was just verified
    // This supports the flow where an API verifies it first, then NextAuth's authorize is called
    const window = options.skipUsedCheckWindow || 0;
    const wasJustVerified = session.lastAttemptAt && (now.getTime() - session.lastAttemptAt.getTime() < window);
    
    if (!wasJustVerified) {
      throw new Error("This OTP has already been used.");
    }
  }

  if (session.expiresAt < now) {
    throw new Error("OTP expired. Please request a new one.");
  }

  if (session.attempts >= 5) {
    throw new Error("Too many attempts. Please request a new OTP.");
  }

  // Verify OTP hash
  const isValid = await bcrypt.compare(otp, session.code);

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

  // Hash password if provided
  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Upsert user
  let user = await prisma.user.findUnique({
    where: { email: email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email,
        name: email.split('@')[0],
        role: "VENDOR",
        password: hashedPassword
      }
    });
  } else if (hashedPassword && !user.password) {
    // If user exists without a password (e.g., from Google auth), update it
    user = await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword }
    });
  }

  return user;
}
