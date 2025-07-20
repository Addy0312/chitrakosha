import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for artwork updates
const updateArtworkSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
  description: z.string().min(1, "Description is required").max(2000, "Description must be less than 2000 characters").optional(),
  imageUrl: z.string().min(1, "Please provide an image URL").optional(),
  images: z.array(z.string()).optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  status: z.enum(['FOR_SALE', 'IN_AUCTION', 'SOLD']).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { artworkId: string } }
) {
  try {
    const { artworkId } = params;

    // Get artwork with artist information
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        auction: true,
      },
    });

    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    return NextResponse.json(artwork);
  } catch (error) {
    console.error('[GET_ARTWORK_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch artwork' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { artworkId: string } }
) {
  try {
    const { artworkId } = params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get artwork to check ownership
    const existingArtwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: { artistId: true, status: true },
    });

    if (!existingArtwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    // Check if user owns the artwork
    if (existingArtwork.artistId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if artwork can be edited (not sold)
    if (existingArtwork.status === 'SOLD') {
      return NextResponse.json(
        { error: 'Cannot edit sold artwork' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateArtworkSchema.parse(body);

    // Update artwork
    const updatedArtwork = await prisma.artwork.update({
      where: { id: artworkId },
      data: validatedData,
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
      message: 'Artwork updated successfully',
      artwork: updatedArtwork,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[PUT_ARTWORK_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update artwork' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { artworkId: string } }
) {
  try {
    const { artworkId } = params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get artwork to check ownership and status
    const existingArtwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: { 
        artistId: true, 
        status: true,
        auction: {
          select: { status: true }
        }
      },
    });

    if (!existingArtwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    // Check if user owns the artwork
    if (existingArtwork.artistId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if artwork can be deleted
    if (existingArtwork.status === 'SOLD') {
      return NextResponse.json(
        { error: 'Cannot delete sold artwork' },
        { status: 400 }
      );
    }

    if (existingArtwork.status === 'IN_AUCTION' && existingArtwork.auction?.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot delete artwork with active auction' },
        { status: 400 }
      );
    }

    // Delete artwork (this will cascade delete related auctions and bids)
    await prisma.artwork.delete({
      where: { id: artworkId },
    });

    return NextResponse.json({
      message: 'Artwork deleted successfully',
    });
  } catch (error) {
    console.error('[DELETE_ARTWORK_ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete artwork' }, { status: 500 });
  }
}