import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const destPath = (formData.get("path") as string) || "documents";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validation
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "File too large. Please upload a file under 5 MB." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Please upload a PDF, JPG, or PNG." },
        { status: 400 }
      );
    }

    const safePath = destPath.replace(/[^a-zA-Z0-9-_]/g, "_");
    const ext = file.name.includes(".")
      ? file.name.substring(file.name.lastIndexOf("."))
      : "";

    const uuid = crypto.randomUUID();
    const filename = `uploads/${safePath}/${uuid}${ext}`;

    // LOCAL STORAGE FALLBACK: If no Vercel Blob token, store to /public/uploads
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn("BLOB_READ_WRITE_TOKEN not found. Saving file to local /public directory.");
      const fs = require('fs/promises');
      const path = require('path');
      
      const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', safePath);
      await fs.mkdir(publicUploadsDir, { recursive: true });
      
      const filePath = path.join(publicUploadsDir, `${uuid}${ext}`);
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(filePath, buffer);
      
      return NextResponse.json({
        success: true,
        url: `/uploads/${safePath}/${uuid}${ext}`,
        fileName: file.name,
      });
    }

    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
