'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [artworks, setArtworks] = useState([
    { id: 1, title: 'My First Masterpiece', description: 'A beautiful painting.', imageUrl: 'https://via.placeholder.com/150', price: '10000' },
    { id: 2, title: 'Digital Art Piece', description: 'Abstract digital art.', imageUrl: 'https://via.placeholder.com/150', price: '15000' },
  ]);

  const [newArtwork, setNewArtwork] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
  });
  
  const [artistApplication, setArtistApplication] = useState<{
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
  } | null>(null);
  
  const [loadingApplication, setLoadingApplication] = useState(true);
  
  // Fetch artist application status
  useEffect(() => {
    const fetchApplicationStatus = async () => {
      if (sessionStatus === 'loading' || !session?.user?.id) return;
      
      try {
        const response = await fetch('/api/users/artist-application');
        if (response.ok) {
          const data = await response.json();
          setArtistApplication(data);
        } else if (response.status !== 404) {
          // 404 means no application found, which is fine
          console.error('Error fetching application status');
        }
      } catch (error) {
        console.error('Error fetching application status:', error);
      } finally {
        setLoadingApplication(false);
      }
    };
    
    fetchApplicationStatus();
  }, [session, sessionStatus]);

  const handleAddArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    setArtworks([...artworks, { id: artworks.length + 1, ...newArtwork }]);
    setNewArtwork({ title: '', description: '', imageUrl: '', price: '', });
  };

  const handleDeleteArtwork = (id: number) => {
    setArtworks(artworks.filter(artwork => artwork.id !== id));
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Check if user is an artist or has a pending application
  const isArtist = session?.user?.isArtist;
  const hasPendingApplication = artistApplication?.status === 'PENDING';
  const hasRejectedApplication = artistApplication?.status === 'REJECTED';

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

      {/* Artist Application Status */}
      {loadingApplication ? (
        <Card className="mb-6">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <p>Loading application status...</p>
          </CardContent>
        </Card>
      ) : !isArtist && !artistApplication ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Become an Artist on Chitrakosha</h3>
                <p className="text-muted-foreground">
                  Apply to become an artist and start selling your artwork on our platform.
                </p>
              </div>
              <Button asChild>
                <Link href="/onboarding/artist">Apply Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : hasPendingApplication ? (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Application Under Review</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your artist application submitted on {formatDate(artistApplication.createdAt)} is currently being reviewed. 
            We'll notify you once a decision has been made.
          </AlertDescription>
        </Alert>
      ) : hasRejectedApplication ? (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <XCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800">Application Not Approved</AlertTitle>
          <AlertDescription className="text-red-700">
            Unfortunately, your artist application was not approved at this time. 
            You may submit a new application with additional portfolio samples.
            <div className="mt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/onboarding/artist">Apply Again</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : isArtist ? (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Artist Status Active</AlertTitle>
          <AlertDescription className="text-green-700">
            Your artist account is active. You can now upload and sell your artwork on Chitrakosha.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Only show artist features if the user is an artist */}
      {isArtist && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Upload New Artwork</CardTitle>
              <CardDescription>
                Add your artwork to the Chitrakosha marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddArtwork} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newArtwork.title}
                    onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newArtwork.description}
                    onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={newArtwork.imageUrl}
                    onChange={(e) => setNewArtwork({ ...newArtwork, imageUrl: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newArtwork.price}
                    onChange={(e) => setNewArtwork({ ...newArtwork, price: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit">Add Artwork</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Artworks</CardTitle>
              <CardDescription>
                Manage your artwork listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {artworks.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  You haven't uploaded any artworks yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {artworks.map(artwork => (
                    <Card key={artwork.id}>
                      <img src={artwork.imageUrl} alt={artwork.title} className="w-full h-48 object-cover rounded-t-lg" />
                      <CardContent className="p-4">
                        <h4 className="font-semibold">{artwork.title}</h4>
                        <p className="text-muted-foreground text-sm">{artwork.description}</p>
                        <p className="font-bold mt-2">₹{artwork.price}</p>
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteArtwork(artwork.id)}>Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Show general user dashboard if not an artist */}
      {!isArtist && (
        <Card>
          <CardHeader>
            <CardTitle>Your Activity</CardTitle>
            <CardDescription>
              View your recent activity on Chitrakosha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>You don't have any recent activity.</p>
              <p className="mt-2">Browse the marketplace to discover amazing artwork!</p>
              <Button className="mt-4" asChild>
                <Link href="/">Explore Marketplace</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
