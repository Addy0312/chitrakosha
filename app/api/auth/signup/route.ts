import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ZodError } from 'zod';

// Create a simplified schema for API validation without the frontend-only fields
const apiSignupSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters."
  }).max(50, {
    message: "First name cannot exceed 50 characters."
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters."
  }).max(50, {
    message: "Last name cannot exceed 50 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }).max(100, {
    message: "Email cannot exceed 100 characters."
  }),
  phone: z.union([
    z.string().min(10, { message: "Phone number must be at least 10 digits." })
      .max(15, { message: "Phone number cannot exceed 15 digits." })
      .regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number." }),
    z.string().max(0),
    z.null(),
    z.undefined()
  ]),
  city: z.union([
    z.string().max(50, { message: "City cannot exceed 50 characters." }),
    z.string().max(0),
    z.null(),
    z.undefined()
  ]),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters."
  }).max(100, {
    message: "Password cannot exceed 100 characters."
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
  }),
  name: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    try {
      // Validate the request body against our simplified schema
      const validatedData = apiSignupSchema.parse(body);
      
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
      
      try {
        // Create user with fields that match the Prisma schema
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone: phone || null,
            city: city || null,
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
      } catch (prismaError) {
        console.error('Prisma error:', prismaError);
        
        // Check if it's a field error
        if (prismaError instanceof Error && prismaError.message && prismaError.message.includes("Unknown field")) {
          // Try creating user without firstName and lastName fields
          const user = await prisma.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
              phone: phone || null,
              city: city || null,
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
        }
        
        throw prismaError;
      }
      
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
