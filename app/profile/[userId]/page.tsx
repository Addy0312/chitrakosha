'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  status: string;
  createdAt: string;
}

interface Order {
  id: string;
  createdAt: string;
  artwork: {
    id: string;
    title: string;
    imageUrl: string;
    price: number;
    artist: {
      id: string;
      name: string;
    };
  };
}

interface Community {
  id: string;
  name: string;
}

interface Membership {
  id: string;
  community: Community;
}

interface UserProfile {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  bio: string | null;
  city: string | null;
  phone: string | null;
  isArtist: boolean;
  image: string | null;
  createdAt: string;
  artworks: Artwork[];
  orders: Order[];
  memberships: Membership[];
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const data = await response.json();
        setUserProfile(data);
      } catch (err) {
        setError('Failed to load user profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, session, status]);

  const handleProfileImageUpload = async (file: File | null) => {
    if (!file || !session || session.user.id !== userId) return;
    
    setIsUploading(true);
    try {
      // Upload the image
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      const { url } = await uploadResponse.json();
      
      // Update the user profile with the new image URL
      const updateResponse = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: url,
        }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Update the local state
      setUserProfile(prev => prev ? { ...prev, image: url } : null);
      toast.success('Profile picture updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 className="text-lg font-medium">Error Loading Profile</h3>
            <p className="text-muted-foreground text-center mt-2">{error}</p>
            <Button onClick={() => router.refresh()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-amber-100 p-3 text-amber-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 className="text-lg font-medium">User Not Found</h3>
            <p className="text-muted-foreground text-center mt-2">
              The user profile you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCurrentUser = session?.user?.id === userId;
  const fullName = userProfile.name || 
    (userProfile.firstName && userProfile.lastName 
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : (userProfile.firstName || userProfile.lastName || 'User'));

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 md:py-8 lg:py-12">
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative group">
            <Avatar className="h-24 w-24 border">
              {userProfile.image ? (
                <AvatarImage src={userProfile.image} alt={fullName} />
              ) : (
                <AvatarFallback className="text-lg">
                  {fullName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            {isCurrentUser && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <label htmlFor="profile-upload" className="text-white text-xs font-medium cursor-pointer">
                  {isUploading ? 'Uploading...' : 'Change'}
                </label>
                <input 
                  id="profile-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) handleProfileImageUpload(file);
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-2xl">{fullName}</CardTitle>
                {userProfile.isArtist && (
                  <Badge variant="outline" className="bg-primary/10 text-primary mt-1">
                    Artist
                  </Badge>
                )}
              </div>
              {isCurrentUser && (
                <Button asChild size="sm">
                  <Link href={`/profile/${userId}/edit`}>Edit Profile</Link>
                </Button>
              )}
            </div>
            <CardDescription className="mt-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Joined {format(new Date(userProfile.createdAt), 'MMMM yyyy')}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-muted-foreground">{userProfile.bio || 'No bio provided.'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{userProfile.email}</span>
                </div>
                {userProfile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{userProfile.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              {userProfile.city ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{userProfile.city}</span>
                </div>
              ) : (
                <p className="text-muted-foreground">No location provided</p>
              )}
            </div>
          </div>
          
          {userProfile.memberships?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Communities</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.memberships.map((membership) => (
                  <Badge key={membership.id} variant="secondary">
                    {membership.community.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue={userProfile.isArtist ? "artworks" : "collection"} className="w-full">
        <TabsList className="w-full">
          {userProfile.isArtist ? (
            <div className="grid w-full grid-cols-3">
              <TabsTrigger value="artworks" className="w-full text-center">Artworks</TabsTrigger>
              <TabsTrigger value="collection" className="w-full text-center">Collection</TabsTrigger>
              <TabsTrigger value="activity" className="w-full text-center">Activity</TabsTrigger>
            </div>
          ) : (
            <div className="grid w-full grid-cols-2">
              <TabsTrigger value="collection" className="w-full text-center">Collection</TabsTrigger>
              <TabsTrigger value="activity" className="w-full text-center">Activity</TabsTrigger>
            </div>
          )}
        </TabsList>
        
        {userProfile.isArtist && (
          <TabsContent value="artworks">
            <Card>
              <CardHeader>
                <CardTitle>Artworks by {fullName}</CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(userProfile.artworks) && userProfile.artworks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {userProfile.artworks.map((artwork) => (
                      <Link href={`/artwork/${artwork.id}`} key={artwork.id}>
                        <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                          <div className="relative h-48 w-full">
                            <ResponsiveImage 
                              src={artwork.imageUrl} 
                              alt={artwork.title} 
                              className="w-full h-full object-cover rounded"
                            />
                            <div className="absolute bottom-2 right-2">
                              <Badge variant={artwork.status === 'SOLD' ? 'destructive' : 'secondary'}>
                                {artwork.status === 'FOR_SALE' ? 'For Sale' : 
                                 artwork.status === 'IN_AUCTION' ? 'In Auction' : 'Sold'}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-semibold truncate">{artwork.title}</h4>
                            <p className="text-muted-foreground">₹{artwork.price.toLocaleString('en-IN')}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No artworks available</p>
                    {isCurrentUser && (
                      <Button asChild className="mt-4">
                        <Link href="/dashboard">Add Artwork</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        <TabsContent value="collection">
          <Card>
            <CardHeader>
              <CardTitle>Art Collection</CardTitle>
              <CardDescription>Artworks purchased by {fullName}</CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile.orders?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProfile.orders.map((order) => (
                    <Link href={`/artwork/${order.artwork.id}`} key={order.id}>
                      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                        <div className="relative h-48 w-full">
                          <ResponsiveImage 
                            src={order.artwork.imageUrl} 
                            alt={order.artwork.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold truncate">{order.artwork.title}</h4>
                          <p className="text-muted-foreground text-sm">
                            By {order.artwork.artist.name}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-muted-foreground">₹{order.artwork.price.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(order.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No purchased artworks</p>
                  {isCurrentUser && (
                    <Button asChild className="mt-4">
                      <Link href="/">Browse Marketplace</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProfile.orders?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Recent Purchases</h3>
                    <div className="space-y-2">
                      {userProfile.orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded overflow-hidden">
                              <img 
                                src={order.artwork.imageUrl} 
                                alt={order.artwork.title} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{order.artwork.title}</p>
                              <p className="text-xs text-muted-foreground">
                                By {order.artwork.artist.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">₹{order.artwork.price.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(order.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {userProfile.isArtist && Array.isArray(userProfile.artworks) && userProfile.artworks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Recently Added Artworks</h3>
                    <div className="space-y-2">
                      {userProfile.artworks
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((artwork) => (
                          <div key={artwork.id} className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded overflow-hidden">
                                <img 
                                  src={artwork.imageUrl} 
                                  alt={artwork.title} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{artwork.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {artwork.status === 'FOR_SALE' ? 'Listed for sale' : 
                                   artwork.status === 'IN_AUCTION' ? 'Listed for auction' : 'Sold'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">₹{artwork.price.toLocaleString('en-IN')}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(artwork.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                {userProfile.memberships?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Community Memberships</h3>
                    <div className="space-y-2">
                      {userProfile.memberships.map((membership) => (
                        <div key={membership.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-medium text-primary">
                                {membership.community.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{membership.community.name}</p>
                              <p className="text-xs text-muted-foreground">Member</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/community/${membership.community.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {userProfile.orders?.length === 0 && 
                 (!userProfile.isArtist || userProfile.artworks.length === 0) && 
                 userProfile.memberships.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}