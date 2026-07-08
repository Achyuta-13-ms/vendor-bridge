import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, otp, password } = await request.json();
    
    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Email and OTP are required' }, { status: 400 });
    }

    const user = await verifyOTP(email, otp, password);

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('[verify-otp]', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Verification failed' 
    }, { status: 400 });
  }
}
