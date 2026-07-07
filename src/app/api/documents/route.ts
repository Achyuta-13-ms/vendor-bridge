import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.vendorId || !data.type || !data.url) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Upsert the document by vendorId and type (so we effectively "replace" if they upload a new one)
    const existingDoc = await prisma.document.findFirst({
      where: { vendorId: data.vendorId, type: data.type }
    });

    let document;
    if (existingDoc) {
      document = await prisma.document.update({
        where: { id: existingDoc.id },
        data: {
          url: data.url,
          originalName: data.originalName,
          mimeType: data.mimeType,
          size: data.size
        }
      });
    } else {
      document = await prisma.document.create({
        data: {
          vendorId: data.vendorId,
          type: data.type,
          url: data.url,
          originalName: data.originalName,
          mimeType: data.mimeType,
          size: data.size
        }
      });
    }

    // Automatically create a Verification record if it doesn't exist
    const existingVerification = await prisma.verification.findUnique({
      where: { documentId: document.id }
    });

    if (!existingVerification) {
      await prisma.verification.create({
        data: {
          documentId: document.id,
          status: "Pending"
        }
      });
    } else {
      await prisma.verification.update({
        where: { id: existingVerification.id },
        data: { status: "Pending" }
      });
    }

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('[POST /api/documents]', error);
    return NextResponse.json({ success: false, message: 'Failed to save document' }, { status: 500 });
  }
}
