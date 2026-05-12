import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
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
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "File too large. Please upload a file under 4 MB." },
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

    const filename = `uploads/${safePath}/${crypto.randomUUID()}${ext}`;

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
