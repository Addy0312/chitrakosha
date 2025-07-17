'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real app, you'd fetch user data from your API
        // For now, we'll use mock data or session data if it's the current user
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const data = await response.json();
        setUserProfile({
          id: data.id,
          name: data.name || 'User',
          email: data.email,
          bio: data.bio,
          isArtist: data.isArtist,
          image: data.image,
          artworks: [
            { id: 1, title: 'My Artwork 1', imageUrl: 'https://via.placeholder.com/150', price: '₹10,000' },
            { id: 2, title: 'My Artwork 2', imageUrl: 'https://via.placeholder.com/150', price: '₹12,000' },
          ],
        });
      } catch (err) {
        setError('Failed to load user profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, session, status]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading profile...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  if (!userProfile) {
    return <div className="container mx-auto p-4">User not found.</div>;
  }

  const isCurrentUser = session?.user?.id === userId;

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>User Profile: {userProfile.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>Bio:</strong> {userProfile.bio}</p>
          {userProfile.isArtist && (
            <p className="text-primary font-semibold mt-2">This user is an artist!</p>
          )}
          {isCurrentUser && (
            <Button asChild className="mt-4">
              <Link href={`/profile/${userId}/edit`}>Edit Profile</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {userProfile.isArtist && (
        <Card>
          <CardHeader>
            <CardTitle>Artworks by {userProfile.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProfile.artworks.map((artwork: any) => (
                <Card key={artwork.id}>
                  <img src={artwork.imageUrl} alt={artwork.title} className="w-full h-32 object-cover rounded-t-lg" />
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{artwork.title}</h4>
                    <p className="text-muted-foreground">{artwork.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}