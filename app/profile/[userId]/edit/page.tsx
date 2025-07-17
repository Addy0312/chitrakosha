'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function EditUserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.id !== userId) {
      router.push('/login'); // Redirect if not logged in or not authorized
      return;
    }

    // Fetch user data for editing (replace with actual API call)
    setLoading(true);
    setError(null);
    try {
      setName(session.user.name || '');
      setBio(session.user.bio || ''); // Assuming bio is part of session.user
    } catch (err) {
      setError('Failed to load profile data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, bio }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Refresh the session to get updated user data
      // This might require a custom refresh mechanism or re-fetching session data
      // For now, we'll just redirect.
      alert('Profile updated successfully!');
      router.push(`/profile/${userId}`);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating profile:', err);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading profile data...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile: {name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={session?.user?.email || ''} disabled />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">Save Changes</Button>
              <Button variant="outline" asChild>
                <Link href={`/profile/${userId}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}