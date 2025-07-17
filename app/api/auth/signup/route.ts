import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signupSchema } from '@/lib/validations/auth';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    try {
      // Validate the request body against our schema
      // We're omitting confirmPassword and termsAccepted as they're only for frontend validation
      const validatedData = signupSchema.omit({ 
        confirmPassword: true, 
        termsAccepted: true 
      }).parse(body);
      
      const { 
        firstName, 
        lastName, 
        email, 
        password,
        phone,
        city
      } = validatedData;
      
      // Construct the full name from first and last name
      const name = body.name || `${firstName} ${lastName}`;
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ 
          message: 'User with this email already exists',
          field: 'email'
        }, { status: 409 });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user with additional fields
      const user = await prisma.user.create({
        data: {
          name,
          firstName,
          lastName,
          email,
          phone: phone || null,
          city: city || null,
          password: hashedPassword,
        },
      });
      
      return NextResponse.json({ 
        message: 'User created successfully', 
        user: { 
          id: user.id, 
          name: user.name,
          email: user.email 
        } 
      }, { status: 201 });
      
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        // Enhanced error handling with field-specific errors
        return NextResponse.json({ 
          message: 'Validation error', 
          errors: validationError.errors 
        }, { status: 400 });
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}
