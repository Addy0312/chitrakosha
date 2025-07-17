import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

// Define validation schema
const artistApplicationSchema = z.object({
  artistName: z.string().min(2, "Artist name must be at least 2 characters"),
  artStyle: z.string().min(1, "Please select your primary art style"),
  yearsOfExperience: z.string().min(1, "Please select your experience level"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
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
    
    // Validate request data
    const validationResult = artistApplicationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { artistName, artStyle, yearsOfExperience, bio, portfolioUrl, portfolioSamples } = validationResult.data;

    // Check if user already has an application
    const existingApplication = await prisma.artistApplication.findUnique({
      where: { userId: session.user.id },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already submitted an application' },
        { status: 400 }
      );
    }

    // Create artist application
    const application = await prisma.artistApplication.create({
      data: {
        userId: session.user.id,
        artistName,
        bio,
        portfolioUrl: portfolioUrl || null,
        // We don't have a metadata field in the schema, so we'll just store the basic fields
        // Additional fields will need to be added to the schema if needed
      },
    });

    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationId: application.id,
    });
  } catch (error) {
    console.error('[ARTIST_APPLICATION_ERROR]', error);
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