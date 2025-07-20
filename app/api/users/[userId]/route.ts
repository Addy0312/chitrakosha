import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        isArtist: true,
        image: true,
        city: true,
        phone: true,
        createdAt: true,
        // Include artworks if the user is an artist
        artworks: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            price: true,
            status: true,
            createdAt: true,
          }
        },
        // Include purchased artworks (orders)
        orders: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            id: true,
            createdAt: true,
            artwork: {
              select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                price: true,
                artist: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        // Include community memberships for activity
        memberships: {
          select: {
            id: true,
            community: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
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
    const { name, firstName, lastName, bio, image, city, phone } = body;

    if (!name && !bio && !image && !firstName && !lastName && !city && !phone) {
      return new NextResponse("No fields to update", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        ...(name && { name }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(bio && { bio }),
        ...(image && { image }),
        ...(city && { city }),
        ...(phone && { phone }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_PATCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
