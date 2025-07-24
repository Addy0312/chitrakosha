import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImageToCloud } from '@/lib/services/cloud';

export const dynamic = 'force-dynamic';

async function processFile(file: File, userId: string): Promise<string> {
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
  // Use userId and timestamp for unique filename
  const ext = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${ext}`;
  // Upload to cloud storage
  const url = await uploadImageToCloud({
    fileBuffer: buffer,
    fileName,
    contentType: file.type,
    folder: 'artwork',
  });
  return url;
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
      const url = await processFile(singleFile, session.user.id);
      return NextResponse.json({ url });
    }

    // Handle multiple file upload
    const uploadPromises = files.map(file => processFile(file, session.user.id));
    const urls = await Promise.all(uploadPromises);
    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error('[UPLOAD_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}