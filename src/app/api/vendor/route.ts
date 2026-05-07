import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId query param is required' }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: {
        user: true,
        documents: {
          include: { verification: true },
        },
        connections: {
          include: { platform: true },
        },
        orders: {
          include: { 
            platform: true,
            customer: true,
            items: true
          },
          orderBy: { placedAt: 'desc' },
          take: 10
        }
      },
    });

    if (!vendor) {
      return NextResponse.json({ success: true, vendor: null });
    }

    return NextResponse.json({ success: true, vendor });
  } catch (error) {
    console.error('[GET /api/vendor]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    const updatedVendor = await prisma.vendor.upsert({
      where: { userId: data.userId },
      update: {
        businessName: data.businessName || undefined,
        addressLine1: data.address || undefined,
        city: data.city || undefined,
        status: "PENDING"
      },
      create: {
        userId: data.userId,
        businessName: data.businessName,
        addressLine1: data.address,
        city: data.city,
        status: "PENDING"
      }
    });

    if (data.documents) {
      for (const [type, url] of Object.entries(data.documents)) {
        if (url) {
          const docType = type.toUpperCase();
          const existingDoc = await prisma.document.findFirst({
            where: { vendorId: updatedVendor.id, type: docType }
          });
          
          if (existingDoc) {
             await prisma.document.update({
               where: { id: existingDoc.id },
               data: { url: url as string }
             });
          } else {
             await prisma.document.create({
               data: {
                 vendorId: updatedVendor.id,
                 type: docType,
                 url: url as string
               }
             });
          }
        }
      }
    }

    return NextResponse.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    console.error('[POST /api/vendor]', error);
    return NextResponse.json({ success: false, message: 'Failed to save vendor details' }, { status: 500 });
  }
}
