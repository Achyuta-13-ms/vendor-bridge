import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Email and OTP are required' }, { status: 400 });
    }

    // Verify dynamic OTP from DB
    const session = await prisma.otpSession.findUnique({
      where: { identifier: email },
    });

    if (!session) {
      return NextResponse.json({ success: false, message: 'OTP request not found. Please resend code.' }, { status: 400 });
    }

    if (session.expiresAt < new Date()) {
      await prisma.otpSession.delete({ where: { identifier: email } });
      return NextResponse.json({ success: false, message: 'OTP expired. Please request a new one.' }, { status: 400 });
    }

    if (otp !== session.code) {
      return NextResponse.json({ success: false, message: 'Invalid verification code.' }, { status: 400 });
    }

    // Delete session after successful verification
    await prisma.otpSession.delete({
      where: { identifier: email },
    });

    console.log(`[OTP VERIFIED] ${email}`);

    // Upsert user in DB using email as the unique identifier
    // Defaulting role to VENDOR
    const user = await prisma.user.findUnique({ where: { email } });
    const userData = { email, role: 'VENDOR', name: email.split('@')[0] };
    
    const upsertedUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: userData,
    });

    console.log(`[USER UPSERT] User ID: ${upsertedUser.id} for email: ${email}`);

    // Generate a realistic mock JWT
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64').replace(/=/g, '');
    const payload = Buffer.from(JSON.stringify({ 
      sub: upsertedUser.id, 
      email: upsertedUser.email, 
      role: upsertedUser.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    })).toString('base64').replace(/=/g, '');
    
    const token = `${header}.${payload}.signature_simulated`;

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: { id: upsertedUser.id, email: upsertedUser.email, role: upsertedUser.role },
    });

  } catch (error) {
    console.error('[verify-otp]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
