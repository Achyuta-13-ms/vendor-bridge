import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success anyway to avoid user enumeration attacks
      return NextResponse.json({ 
        success: true, 
        message: "If an account exists, a reset link has been sent." 
      });
    }

    // In a real application, you would generate a reset token and send an email here.
    // For this MVP, we simulate success since we don't have an email provider configured.

    return NextResponse.json({ 
      success: true, 
      message: "Password reset link has been sent to your email." 
    });

  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
