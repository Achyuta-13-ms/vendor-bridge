import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

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
