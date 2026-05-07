import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendWebhook } from '@/services/webhook';

export async function POST(request: Request) {
  try {
    const { documentId, status, rejectionReason } = await request.json();

    if (!documentId || !status) {
      return NextResponse.json({ success: false, message: 'documentId and status are required' }, { status: 400 });
    }

    const verification = await prisma.verification.upsert({
      where: { documentId },
      update: {
        status,
        rejectionReason: status === 'Rejected' ? rejectionReason : null,
        response: status === 'Verified' ? 'Document manually verified by admin' : `Rejected: ${rejectionReason || 'No reason provided'}`,
      },
      create: {
        documentId,
        status,
        rejectionReason: status === 'Rejected' ? rejectionReason : null,
        response: status === 'Verified' ? 'Document manually verified by admin' : `Rejected: ${rejectionReason || 'No reason provided'}`,
      },
    });

    // 1. Fetch document context securely
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        vendor: {
          include: {
            documents: { include: { verification: true } }
          }
        }
      }
    });

    if (doc) {
      if (status === 'Verified') {
         sendWebhook("document.verified", {
           vendorId: doc.vendorId,
           documentType: doc.type,
           status: "verified"
         }).catch(console.error);

         const vendorDocs = doc.vendor?.documents || [];
         const requiredTypes = ["GST", "PAN", "BANK"];
         
         const isFullyVerified = requiredTypes.every(reqType => {
           const typeDocs = vendorDocs.filter(d => d.type === reqType);
           return typeDocs.length > 0 && typeDocs.some(d => d.verification?.status === "Verified");
         });

         if (isFullyVerified) {
           sendWebhook("vendor.verified", {
             vendorId: doc.vendorId,
             status: "verified"
           }).catch(console.error);
         }

      } else if (status === 'Rejected' || status === 'Failed') {
         sendWebhook("document.failed", {
           vendorId: doc.vendorId,
           documentType: doc.type,
           status: "failed"
         }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, verification });
  } catch (error) {
    console.error('[vendor/verify]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
