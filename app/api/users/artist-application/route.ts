import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for artist application
const artistApplicationSchema = z.object({
  artistName: z.string().min(2, "Artist name must be at least 2 characters"),
  artStyle: z.string().min(1, "Please select your primary art style"),
  yearsOfExperience: z.string().min(1, "Please select your experience level"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  portfolioUrl: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, "Please enter a valid URL"),
  portfolioSamples: z.array(z.string()).min(1, "At least one portfolio sample is required"),
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    console.log('Received application data:', body);

    // Validate input
    const validatedData = artistApplicationSchema.parse(body);

    // Check if user already has an application
    const existingApplication = await prisma.artistApplication.findUnique({
      where: { userId: session.user.id },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already submitted an artist application' },
        { status: 400 }
      );
    }

    // Check if user is already an artist
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isArtist: true },
    });

    if (user?.isArtist) {
      return NextResponse.json(
        { error: 'You are already an approved artist' },
        { status: 400 }
      );
    }

    // Create artist application
    const application = await prisma.artistApplication.create({
      data: {
        userId: session.user.id,
        artistName: validatedData.artistName,
        portfolioUrl: validatedData.portfolioUrl || null,
        bio: validatedData.bio,
        status: 'PENDING',
        metadata: {
          artStyle: validatedData.artStyle,
          yearsOfExperience: validatedData.yearsOfExperience,
          portfolioSamples: validatedData.portfolioSamples,
        },
      },
    });

    return NextResponse.json({
      message: 'Artist application submitted successfully',
      application,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[POST_ARTIST_APPLICATION_ERROR]', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's application
    const application = await prisma.artistApplication.findUnique({
      where: { userId: session.user.id },
    });

    if (!application) {
      return NextResponse.json({ error: 'No application found' }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('[GET_ARTIST_APPLICATION_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}