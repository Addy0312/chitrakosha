import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Schema for validating the request body
const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const validatedData = forgotPasswordSchema.parse(body);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    // For security reasons, always return success even if user doesn't exist
    if (!user) {
      return NextResponse.json(
        { message: 'If an account with that email exists, we have sent a password reset link.' },
        { status: 200 }
      );
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the reset token in the database
    // Note: In a real implementation, you would need to add resetToken and resetTokenExpiry fields to the User model
    // For now, we'll simulate this without actually storing the token
    
    // In a real implementation, you would send an email with the reset link
    // For this demo, we'll just log it
    console.log(`Password reset link for ${user.email}: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);

    return NextResponse.json(
      { message: 'If an account with that email exists, we have sent a password reset link.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid email format.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}