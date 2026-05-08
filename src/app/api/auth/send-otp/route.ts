import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmailOTP } from '@/lib/otp-services';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    // Cooldown check
    const existingSession = await prisma.otpSession.findUnique({
      where: { identifier: email }
    });

    if (existingSession && !existingSession.isUsed) {
      const timeSinceLastOtp = Date.now() - existingSession.createdAt.getTime();
      if (timeSinceLastOtp < 30 * 1000) { // 30 seconds cooldown
        return NextResponse.json({ success: false, message: 'Please wait before requesting a new OTP' }, { status: 429 });
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Store in DB
    await prisma.otpSession.upsert({
      where: { identifier: email },
      update: { 
        code: hashedOtp, 
        expiresAt, 
        attempts: 0, 
        isUsed: false, 
        createdAt: new Date() 
      },
      create: { 
        identifier: email, 
        code: hashedOtp, 
        expiresAt 
      },
    });

    const result = await sendEmailOTP(email, otp);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.mock ? 'Mock OTP sent (Dev mode)' : 'OTP sent successfully',
        mock: result.mock,
        otp: result.mock ? otp : undefined, // Include OTP for UI display in mock mode
        mockStatus: result.mock ? 'Mock delivery' : 'Real delivery'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message || 'Failed to send OTP' 
      }, { status: result.status || 500 });
    }

  } catch (error: any) {
    console.error('[send-otp]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
