import { NextResponse } from 'next/server';
import path from 'path';
import crypto from 'crypto';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const destPath = formData.get('path') as string || 'documents';

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is missing');
      return NextResponse.json({ success: false, message: 'Upload configuration error' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe unique filename
    const extension = path.extname(file.name);
    const fileName = `${crypto.randomUUID()}${extension}`;
    const blobPath = `${destPath}/${fileName}`;
    
    // Upload to Vercel Blob
    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: file.name
    });

  } catch (error: any) {
    console.error('[POST /api/upload]', error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
