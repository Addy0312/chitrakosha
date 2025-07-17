import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { 
        id: true,
        name: true,
        email: true,
        bio: true,
        isArtist: true,
        image: true,
      } // Select specific fields to return
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio } = body;

    if (!name && !bio) {
      return new NextResponse("No fields to update", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_PATCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
