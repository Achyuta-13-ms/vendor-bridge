import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sharedLinkId, organization, purpose } = body;

    if (!sharedLinkId) {
      return NextResponse.json({ success: false, message: "Shared link ID required" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown IP";

    await prisma.accessLog.create({
      data: {
        sharedLinkId,
        accessorIp: ip as string,
        organization: organization || "Anonymous Viewer",
        purpose: purpose || "Viewed Identity Profile",
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[POST /api/identity/log-access]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
