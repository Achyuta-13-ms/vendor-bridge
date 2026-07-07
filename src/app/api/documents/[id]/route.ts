import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { del } from '@vercel/blob';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    if (!documentId) {
      return NextResponse.json({ success: false, message: 'Document ID is required' }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    // Attempt to delete from Vercel Blob if it's a blob URL
    if (document.url.includes('vercel-storage.com')) {
      try {
        await del(document.url);
      } catch (e) {
        console.error("Failed to delete blob from vercel:", e);
      }
    } else if (document.url.startsWith('/uploads/')) {
      // Local fallback file deletion
      try {
        const fs = require('fs/promises');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'public', document.url);
        await fs.unlink(filePath);
      } catch (e) {
        console.error("Failed to delete local file:", e);
      }
    }

    // Delete DB record (verification will cascade if configured, but let's delete manually just in case)
    await prisma.verification.deleteMany({
      where: { documentId: document.id }
    });
    
    await prisma.document.delete({
      where: { id: document.id }
    });

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/documents/[id]]', error);
    return NextResponse.json({ success: false, message: 'Failed to delete document' }, { status: 500 });
  }
}
