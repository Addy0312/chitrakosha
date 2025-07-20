import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// Helper function to check if user is admin
async function isAdmin(userId: string) {
  // In a real application, you would check if the user has admin privileges
  // For now, we'll use a simple check - you can replace this with your actual admin check logic
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  // For demo purposes, consider specific emails as admins
  // In production, you would have a proper role system
  const adminEmails = [
    "admin@chitrakosha.com",
    "admin@example.com",
    // Add your email here for testing
  ];
  return user && adminEmails.includes(user.email);
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const admin = await isAdmin(session.user.id);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all artist applications with user information
    const applications = await prisma.artistApplication.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // PENDING first
        { createdAt: "desc" }, // Newest first
      ],
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("[GET_ARTIST_APPLICATIONS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
