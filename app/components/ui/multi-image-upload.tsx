'use client';

import { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Plus } from 'lucide-react';
import Image from 'next/image';

interface MultiImageUploadProps {
  onImagesChange: (files: File[]) => void;
  currentImages?: string[];
  maxImages?: number;
  label?: string;
}

export function MultiImageUpload({
  onImagesChange,
  currentImages = [],
  maxImages = 5,
  label = 'Upload Images'
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(currentImages);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length + previews.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    const newFiles = [...files, ...selectedFiles];
    const newPreviews = [...previews];

    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        setPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    setFiles(newFiles);
    onImagesChange(newFiles);
  };

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFiles = files.filter((_, i) => i !== index);
    
    setPreviews(newPreviews);
    setFiles(newFiles);
    onImagesChange(newFiles);
  };

  const canAddMore = previews.length < maxImages;

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* Image Previews Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full h-32 rounded-md overflow-hidden border">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          
          {/* Add More Button */}
          {canAddMore && (
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="multi-image-upload"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-32 border-dashed border-2 flex flex-col items-center justify-center"
                onClick={() => document.getElementById('multi-image-upload')?.click()}
              >
                <Plus className="h-6 w-6 mb-2" />
                <span className="text-sm">Add Images</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Initial Upload Button */}
      {previews.length === 0 && (
        <div>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="initial-image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('initial-image-upload')?.click()}
            className="w-full h-32 border-dashed border-2 flex flex-col items-center justify-center"
          >
            <Upload className="h-8 w-8 mb-2" />
            <span>Upload Images</span>
            <span className="text-sm text-muted-foreground mt-1">
              Up to {maxImages} images (JPG, PNG, GIF, SVG - max 5MB each)
            </span>
          </Button>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {previews.length} of {maxImages} images uploaded
      </p>
    </div>
  );
}