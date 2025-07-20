import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for artwork creation
const artworkSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(2000, "Description must be less than 2000 characters"),
  imageUrl: z.string().min(1, "Please provide an image URL"),
  images: z.array(z.string()).optional().default([]),
  price: z.number().positive("Price must be a positive number"),
  status: z.enum(['FOR_SALE', 'IN_AUCTION', 'SOLD']).optional().default('FOR_SALE'),
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an artist
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isArtist: true },
    });

    if (!user?.isArtist) {
      return NextResponse.json(
        { error: 'Only artists can create artwork listings' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = artworkSchema.parse(body);

    // Create artwork
    const artwork = await prisma.artwork.create({
      data: {
        ...validatedData,
        artistId: session.user.id,
      },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Artwork created successfully',
      artwork,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[POST_ARTWORK_ERROR]', error);
    return NextResponse.json({ error: 'Failed to create artwork' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const artistId = searchParams.get('artistId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    if (artistId) {
      where.artistId = artistId;
    }
    if (status) {
      where.status = status;
    }

    // Get artworks with artist information
    const artworks = await prisma.artwork.findMany({
      where,
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.artwork.count({ where });

    return NextResponse.json({
      artworks,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('[GET_ARTWORKS_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 });
  }
}