import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return Response.json(users);
  } catch (error: any) {
    console.error("Database connection error:", error);
    return Response.json({ error: "Failed to connect to database" }, { status: 500 });
  }
}
