import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use Vercel Blob if token is available (Production/Vercel)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blobPath = `${destPath}/${crypto.randomUUID()}${path.extname(file.name)}`;
      
      const blob = await put(blobPath, buffer, {
        access: 'public',
        contentType: file.type,
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        fileName: file.name
      });
    }

    // Local Development Fallback
    console.log('BLOB_READ_WRITE_TOKEN not found, falling back to local filesystem');
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', destPath);
    await mkdir(uploadDir, { recursive: true });

    // Sanitize filename & generate unique path pattern
    const extension = path.extname(file.name);
    const fileName = `${crypto.randomUUID()}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${destPath}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name
    });

  } catch (error: any) {
    console.error('[POST /api/upload]', error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
