import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Schema for validating the request body
const resetPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).max(100, {
    message: "Password cannot exceed 100 characters."
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
  }).regex(/^(?=.*[!@#$%^&*])/, {
    message: "Password must contain at least one special character (!@#$%^&*).",
  }),
  token: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const validatedData = resetPasswordSchema.parse(body);
    
    // In a real implementation, you would:
    // 1. Find the user by the reset token
    // 2. Check if the token is valid and not expired
    // 3. Update the user's password
    // 4. Remove the reset token
    
    // For this demo, we'll simulate a successful password reset
    // Note: In a real implementation, you would need to add resetToken and resetTokenExpiry fields to the User model
    
    // Simulate finding a user by token
    // const user = await prisma.user.findFirst({
    //   where: {
    //     resetToken: validatedData.token,
    //     resetTokenExpiry: {
    //       gt: new Date(),
    //     },
    //   },
    // });
    
    // if (!user) {
    //   return NextResponse.json(
    //     { message: 'Invalid or expired reset token. Please request a new password reset.' },
    //     { status: 400 }
    //   );
    // }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Update the user's password
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     password: hashedPassword,
    //     resetToken: null,
    //     resetTokenExpiry: null,
    //   },
    // });
    
    // For demo purposes, log that we would update the password
    console.log(`Password would be updated to: ${hashedPassword}`);
    
    return NextResponse.json(
      { message: 'Password has been reset successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid password format.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}