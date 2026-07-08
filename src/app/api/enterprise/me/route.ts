import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Fetch the enterprise user record for this user
    const entUser = await prisma.enterpriseUser.findFirst({
      where: { userId },
      include: { enterprise: true }
    });

    if (!entUser) {
      return NextResponse.json({ success: false, message: "No enterprise profile found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, enterprise: entUser.enterprise, role: entUser.role });
  } catch (error: any) {
    console.error("[GET /api/enterprise/me]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
