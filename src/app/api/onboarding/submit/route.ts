import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      businessName,
      businessType,
      description,
      phone,
      email: bizEmail,
      website,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      // Document URLs
      gstUrl,
      panUrl,
      bankUrl,
    } = body;

    // Upsert Vendor profile
    const vendor = await prisma.vendor.upsert({
      where: { userId: user.id },
      update: {
        businessName,
        businessType,
        description,
        phone,
        email: bizEmail,
        website,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country: country || 'India',
        status: 'PENDING',
      },
      create: {
        userId: user.id,
        businessName,
        businessType,
        description,
        phone,
        email: bizEmail,
        website,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country: country || 'India',
        status: 'PENDING',
      },
    });

    // Save documents and create PENDING verification records
    const docEntries: { type: string; url: string }[] = [];
    if (gstUrl) docEntries.push({ type: 'GST', url: gstUrl });
    if (panUrl) docEntries.push({ type: 'PAN', url: panUrl });
    if (bankUrl) docEntries.push({ type: 'BANK', url: bankUrl });

    for (const { type, url } of docEntries) {
      // Upsert document
      const existingDoc = await prisma.document.findFirst({
        where: { vendorId: vendor.id, type },
      });

      let doc;
      if (existingDoc) {
        doc = await prisma.document.update({
          where: { id: existingDoc.id },
          data: { url, updatedAt: new Date() },
        });
      } else {
        doc = await prisma.document.create({
          data: { vendorId: vendor.id, type, url },
        });
      }

      // Upsert verification record with PENDING status
      const existingVerification = await prisma.verification.findUnique({
        where: { documentId: doc.id },
      });

      if (!existingVerification) {
        await prisma.verification.create({
          data: {
            documentId: doc.id,
            status: 'PENDING',
          },
        });
      }
    }

    return NextResponse.json({ success: true, vendorId: vendor.id });
  } catch (error: any) {
    console.error('[POST /api/onboarding/submit]', error);
    return NextResponse.json({ success: false, message: 'Submission failed' }, { status: 500 });
  }
}
