'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { profileEditSchema, type ProfileEditFormValues } from '@/lib/validations/profile';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export default function EditUserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: '',
      firstName: '',
      lastName: '',
      bio: '',
      city: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.id !== userId) {
      router.push('/login'); // Redirect if not logged in or not authorized
      return;
    }

    // Fetch user data for editing
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        // Set form values
        form.reset({
          name: userData.name || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          bio: userData.bio || '',
          city: userData.city || '',
          phone: userData.phone || '',
        });
        
        // Set profile image
        setProfileImage(userData.image);
      } catch (err) {
        setError('Failed to load profile data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, session, status, router, form]);

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      const data = await response.json();
      setProfileImage(data.url);
      
      // Update user profile with new image
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: data.url }),
      });
      
      toast.success('Profile picture updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
      console.error('Error uploading image:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (values: ProfileEditFormValues) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Update the session with new user data
      await updateSession({
        user: {
          ...session?.user,
          name: values.name,
          firstName: values.firstName,
          lastName: values.lastName,
        }
      });

      toast.success('Profile updated successfully!');
      router.push(`/profile/${userId}`);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Your Profile</CardTitle>
          <CardDescription>Update your personal information and profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4 mt-2">
              <Avatar className="h-24 w-24 border">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-lg">
                    {form.getValues('name')?.charAt(0) || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <FileUpload
                  onFileChange={handleImageUpload}
                  currentImageUrl={profileImage}
                  accept="image/*"
                  label="Upload Profile Picture"
                />
                {uploadingImage && (
                  <p className="text-sm text-muted-foreground mt-2">Uploading image...</p>
                )}
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={session?.user?.email || ''} disabled />
                <p className="text-sm text-muted-foreground mt-1">
                  Email cannot be changed.
                </p>
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional contact number for your profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Where are you located?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Tell us about yourself..."
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Share a brief description about yourself. This will be visible on your profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/profile/${userId}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}