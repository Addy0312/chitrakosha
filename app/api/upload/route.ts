import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

async function processFile(file: File): Promise<string> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}`);
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large (max 5MB)');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create unique filename
  const ext = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${ext}`;
  
  // In a production app, you would upload to cloud storage like S3
  // For this implementation, we'll save to the public directory
  const uploadDir = join(process.cwd(), 'public/uploads');
  const filePath = join(uploadDir, fileName);
  
  // Ensure directory exists
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  
  await writeFile(filePath, buffer);
  
  // Return the URL to the uploaded file
  return `/uploads/${fileName}`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    
    // Check if it's a single file or multiple files
    const files = formData.getAll('file') as File[];
    const singleFile = formData.get('file') as File;

    if (!files.length && !singleFile) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Handle single file upload (backward compatibility)
    if (singleFile && files.length <= 1) {
      const url = await processFile(singleFile);
      return NextResponse.json({ url });
    }

    // Handle multiple file upload
    const uploadPromises = files.map(file => processFile(file));
    const urls = await Promise.all(uploadPromises);
    
    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error('[UPLOAD_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}