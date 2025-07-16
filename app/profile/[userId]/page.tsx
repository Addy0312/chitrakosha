'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId;

  // Mock user data (replace with actual data fetching)
  const user = {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    bio: `This is the bio for user ${userId}. They are an art enthusiast.`,
    isArtist: userId === 'artist123', // Example: Mark a specific ID as artist
    artworks: [
      { id: 1, title: 'Artwork 1', imageUrl: 'https://via.placeholder.com/150', price: '₹10,000' },
      { id: 2, title: 'Artwork 2', imageUrl: 'https://via.placeholder.com/150', price: '₹12,000' },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>User Profile: {user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Bio:</strong> {user.bio}</p>
          {user.isArtist && (
            <p className="text-primary font-semibold mt-2">This user is an artist!</p>
          )}
          <Button asChild className="mt-4">
            <Link href={`/profile/${userId}/edit`}>Edit Profile</Link>
          </Button>
        </CardContent>
      </Card>

      {user.isArtist && (
        <Card>
          <CardHeader>
            <CardTitle>Artworks by {user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.artworks.map(artwork => (
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
