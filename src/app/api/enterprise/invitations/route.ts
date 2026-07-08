import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const entUser = await prisma.enterpriseUser.findFirst({
      where: { userId },
    });

    if (!entUser) {
      return NextResponse.json({ success: false, message: "Not an enterprise user" }, { status: 403 });
    }

    const invitations = await prisma.enterpriseInvitation.findMany({
      where: { enterpriseId: entUser.enterpriseId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, invitations });
  } catch (error: any) {
    console.error("[GET /api/enterprise/invitations]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const entUser = await prisma.enterpriseUser.findFirst({
      where: { userId },
    });

    if (!entUser || entUser.role === 'VIEWER') {
      return NextResponse.json({ success: false, message: "Not authorized to invite" }, { status: 403 });
    }

    const { businessName, email, phone, message } = await req.json();

    if (!businessName || !email) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invitation = await prisma.enterpriseInvitation.create({
      data: {
        enterpriseId: entUser.enterpriseId,
        businessName,
        email,
        phone,
        message,
        token,
        expiresAt,
        status: "SENT"
      }
    });

    // In a real app, send an email here using the generated token link

    return NextResponse.json({ success: true, invitation });
  } catch (error: any) {
    console.error("[POST /api/enterprise/invitations]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
