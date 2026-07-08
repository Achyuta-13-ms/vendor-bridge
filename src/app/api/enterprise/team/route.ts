import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

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

    const team = await prisma.enterpriseUser.findMany({
      where: { enterpriseId: entUser.enterpriseId },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({ success: true, team });
  } catch (error: any) {
    console.error("[GET /api/enterprise/team]", error);
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

    // Only Admin can invite team members
    if (!entUser || entUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: "Not authorized. Admin access required." }, { status: 403 });
    }

    const { name, email, role } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Check if user exists, if not create them (in a real app, send an invite link to register)
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const hashedPassword = await bcrypt.hash("TempPassword123!", 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "ENTERPRISE",
        }
      });
    }

    // Link user to enterprise
    const existingLink = await prisma.enterpriseUser.findUnique({
      where: {
        userId_enterpriseId: {
          userId: user.id,
          enterpriseId: entUser.enterpriseId
        }
      }
    });

    if (existingLink) {
      return NextResponse.json({ success: false, message: "User is already in the team" }, { status: 400 });
    }

    const newTeamMember = await prisma.enterpriseUser.create({
      data: {
        userId: user.id,
        enterpriseId: entUser.enterpriseId,
        role
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({ success: true, teamMember: newTeamMember });
  } catch (error: any) {
    console.error("[POST /api/enterprise/team]", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
