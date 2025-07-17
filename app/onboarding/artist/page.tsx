'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';

// Define validation schema
const artistApplicationSchema = z.object({
  artistName: z.string().min(2, "Artist name must be at least 2 characters"),
  artStyle: z.string().min(1, "Please select your primary art style"),
  yearsOfExperience: z.string().min(1, "Please select your experience level"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export default function ArtistOnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [artistName, setArtistName] = useState('');
  const [artStyle, setArtStyle] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [bio, setBio] = useState('');
  
  // Portfolio samples (up to 3)
  const [portfolioFiles, setPortfolioFiles] = useState<(File | null)[]>([null, null, null]);

  const validateForm = () => {
    try {
      artistApplicationSchema.parse({
        artistName,
        artStyle,
        yearsOfExperience,
        bio,
        portfolioUrl,
      });
      
      // Check if at least one portfolio file is uploaded
      if (portfolioFiles.every(file => file === null)) {
        return { valid: false, errors: { portfolioFiles: "Please upload at least one portfolio sample" } };
      }
      
      return { valid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        return { valid: false, errors: formattedErrors };
      }
      return { valid: false, errors: { form: "Invalid form data" } };
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
    
    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const { valid, errors: validationErrors } = validateForm();
    if (!valid) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Upload portfolio files
      const portfolioUrls = await Promise.all(
        portfolioFiles
          .filter((file): file is File => file !== null)
          .map(file => uploadFile(file))
      );
      
      // Submit application
      const response = await fetch('/api/users/artist-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistName,
          artStyle,
          yearsOfExperience,
          portfolioUrl,
          bio,
          portfolioSamples: portfolioUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

      toast.success('Artist application submitted! We will review your application shortly.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      console.error('Error submitting artist application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newFiles = [...portfolioFiles];
    newFiles[index] = file;
    setPortfolioFiles(newFiles);
    
    // Clear error if at least one file is uploaded
    if (file && errors.portfolioFiles) {
      const newErrors = {...errors};
      delete newErrors.portfolioFiles;
      setErrors(newErrors);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Become an Artist on Chitrakosha</CardTitle>
          <CardDescription>
            Complete this application to showcase and sell your artwork on our platform.
            Our team will review your application and get back to you within 48 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="artistName">Artist Name</Label>
                <Input
                  id="artistName"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Your artist name or pseudonym"
                  className={errors.artistName ? "border-red-500" : ""}
                />
                {errors.artistName && (
                  <p className="text-red-500 text-sm mt-1">{errors.artistName}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artStyle">Primary Art Style</Label>
                  <Select value={artStyle} onValueChange={setArtStyle}>
                    <SelectTrigger id="artStyle" className={errors.artStyle ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your primary art style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traditional">Traditional Indian Art</SelectItem>
                      <SelectItem value="contemporary">Contemporary</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                      <SelectItem value="digital">Digital Art</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="sculpture">Sculpture</SelectItem>
                      <SelectItem value="mixed-media">Mixed Media</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.artStyle && (
                    <p className="text-red-500 text-sm mt-1">{errors.artStyle}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Select value={yearsOfExperience} onValueChange={setYearsOfExperience}>
                    <SelectTrigger id="yearsOfExperience" className={errors.yearsOfExperience ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                      <SelectItem value="experienced">Experienced (6-10 years)</SelectItem>
                      <SelectItem value="professional">Professional (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.yearsOfExperience && (
                    <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="portfolioUrl">Portfolio URL (Optional)</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://your-portfolio-website.com"
                  className={errors.portfolioUrl ? "border-red-500" : ""}
                />
                {errors.portfolioUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.portfolioUrl}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="bio">Tell us about yourself and your art</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  placeholder="Describe your artistic journey, inspiration, and what makes your art unique..."
                  className={errors.bio ? "border-red-500" : ""}
                />
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Minimum 50 characters. This will be displayed on your artist profile.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Portfolio Samples (Upload at least one)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => (
                    <FileUpload
                      key={index}
                      onFileChange={(file) => handleFileChange(index, file)}
                      accept="image/*"
                      label={`Sample ${index + 1}`}
                    />
                  ))}
                </div>
                {errors.portfolioFiles && (
                  <p className="text-red-500 text-sm mt-1">{errors.portfolioFiles}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Upload up to 3 samples of your best work. Accepted formats: JPG, PNG, GIF, SVG (max 5MB each)
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
