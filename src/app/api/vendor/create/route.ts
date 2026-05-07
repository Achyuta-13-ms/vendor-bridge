import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    // Check if vendor already exists for this user
    let vendor = await prisma.vendor.findUnique({ 
      where: { userId: data.userId } 
    });
    
    if (!vendor) {
      // Create vendor if it doesn't exist
      vendor = await prisma.vendor.create({
        data: {
          userId: data.userId,
          status: 'PENDING',
          // Use default values for required DB structures if any, else leave as null
        }
      });
    }

    return NextResponse.json({
      success: true,
      vendor: vendor
    });
  } catch (error) {
    console.error('[vendor/create]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
