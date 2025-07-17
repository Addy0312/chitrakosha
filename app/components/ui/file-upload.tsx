'use client';

import { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  currentImageUrl?: string | null;
  accept?: string;
  label?: string;
}

export function FileUpload({
  onFileChange,
  currentImageUrl = null,
  accept = 'image/*',
  label = 'Upload Image'
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileChange(file);
    } else {
      setPreview(currentImageUrl);
      setFileName(null);
      onFileChange(null);
    }
  };

  const clearFile = () => {
    setPreview(null);
    setFileName(null);
    onFileChange(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">{label}</Label>
      <div className="flex flex-col gap-4">
        {preview && (
          <div className="relative w-32 h-32 mx-auto">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            id="file-upload"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {fileName || (preview ? 'Change Image' : 'Select Image')}
          </Button>
          {(fileName || preview) && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}