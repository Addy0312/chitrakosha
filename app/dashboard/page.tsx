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
import { Loader2, AlertCircle, CheckCircle, XCircle, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { MultiImageUpload } from '@/components/ui/multi-image-upload';
import { ArtistStats } from '@/components/artist-stats';

// Define types
interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  images?: string[];
  price: number;
  status: 'FOR_SALE' | 'IN_AUCTION' | 'SOLD';
  createdAt: string;
  updatedAt: string;
  artist: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loadingArtworks, setLoadingArtworks] = useState(true);

  const [newArtwork, setNewArtwork] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
  });
  
  const [newArtworkFile, setNewArtworkFile] = useState<File | null>(null);
  const [newArtworkImages, setNewArtworkImages] = useState<File[]>([]);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [editingArtworkFile, setEditingArtworkFile] = useState<File | null>(null);
  const [editingArtworkImages, setEditingArtworkImages] = useState<File[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [artistApplication, setArtistApplication] = useState<{
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
  } | null>(null);
  
  const [loadingApplication, setLoadingApplication] = useState(true);
  
  // State to track if user is actually an artist (from database)
  const [userIsArtist, setUserIsArtist] = useState<boolean | null>(null);

  // Fetch artist application status and user status
  useEffect(() => {
    const fetchApplicationStatus = async () => {
      if (sessionStatus === 'loading' || !session?.user?.id) return;
      
      try {
        // Check user's current artist status from database
        const userResponse = await fetch(`/api/users/${session.user.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserIsArtist(userData.isArtist);
        }

        // Check application status
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

  // Fetch artworks for artists
  useEffect(() => {
    const fetchArtworks = async () => {
      const currentIsArtist = userIsArtist ?? session?.user?.isArtist;
      
      if (sessionStatus === 'loading' || !session?.user?.id || !currentIsArtist) {
        setLoadingArtworks(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/artworks?artistId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setArtworks(data.artworks);
        } else {
          console.error('Error fetching artworks');
          toast.error('Failed to load artworks');
        }
      } catch (error) {
        console.error('Error fetching artworks:', error);
        toast.error('Failed to load artworks');
      } finally {
        setLoadingArtworks(false);
      }
    };
    
    fetchArtworks();
  }, [session, sessionStatus, userIsArtist]);

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

  const handleAddArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = newArtwork.imageUrl;
      
      // Upload primary image file if one is selected
      if (newArtworkFile) {
        imageUrl = await uploadFile(newArtworkFile);
      }
      
      if (!imageUrl) {
        throw new Error('Please provide a primary image for your artwork');
      }

      // Upload additional images
      const additionalImageUrls = await Promise.all(
        newArtworkImages.map(file => uploadFile(file))
      );

      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newArtwork.title,
          description: newArtwork.description,
          imageUrl: imageUrl,
          images: additionalImageUrls,
          price: parseFloat(newArtwork.price),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create artwork');
      }

      const data = await response.json();
      setArtworks([data.artwork, ...artworks]);
      setNewArtwork({ title: '', description: '', imageUrl: '', price: '' });
      setNewArtworkFile(null);
      setNewArtworkImages([]);
      toast.success('Artwork created successfully!');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      console.error('Error creating artwork:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setIsEditDialogOpen(true);
  };

  const handleUpdateArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = editingArtwork.imageUrl;
      
      // Upload new file if one is selected
      if (editingArtworkFile) {
        imageUrl = await uploadFile(editingArtworkFile);
      }

      // Upload additional images if any new ones are selected
      let additionalImageUrls = editingArtwork.images || [];
      if (editingArtworkImages.length > 0) {
        const newImageUrls = await Promise.all(
          editingArtworkImages.map(file => uploadFile(file))
        );
        additionalImageUrls = newImageUrls;
      }

      const response = await fetch(`/api/artworks/${editingArtwork.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingArtwork.title,
          description: editingArtwork.description,
          imageUrl: imageUrl,
          images: additionalImageUrls,
          price: editingArtwork.price,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update artwork');
      }

      const data = await response.json();
      setArtworks(artworks.map(artwork => 
        artwork.id === editingArtwork.id ? data.artwork : artwork
      ));
      setIsEditDialogOpen(false);
      setEditingArtwork(null);
      setEditingArtworkFile(null);
      setEditingArtworkImages([]);
      toast.success('Artwork updated successfully!');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      console.error('Error updating artwork:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/artworks/${artworkId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete artwork');
      }

      setArtworks(artworks.filter(artwork => artwork.id !== artworkId));
      toast.success('Artwork deleted successfully!');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      console.error('Error deleting artwork:', error);
    }
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
  const isArtist = userIsArtist ?? session?.user?.isArtist;
  const hasPendingApplication = artistApplication?.status === 'PENDING';
  const hasRejectedApplication = artistApplication?.status === 'REJECTED';

  // Debug logging
  console.log('Dashboard Debug:', {
    sessionStatus,
    userId: session?.user?.id,
    isArtist,
    userIsArtist,
    artistApplication,
    sessionUser: session?.user
  });

  // If session is loading, show loading state
  if (sessionStatus === 'loading') {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

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
          {/* Artist Statistics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Performance</CardTitle>
              <CardDescription>
                Track your sales, earnings, and artwork performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArtistStats artistId={session?.user?.id || ''} />
            </CardContent>
          </Card>

          {/* Upload New Artwork Section */}
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
                  <FileUpload
                    onFileChange={(file) => setNewArtworkFile(file)}
                    label="Primary Artwork Image"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload the main image of your artwork (JPG, PNG, GIF, SVG - max 5MB)
                  </p>
                </div>
                <div>
                  <MultiImageUpload
                    onImagesChange={(files) => setNewArtworkImages(files)}
                    maxImages={4}
                    label="Additional Images (Optional)"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload up to 4 additional images to showcase different angles or details
                  </p>
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Adding...' : 'Add Artwork'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Auction Creation Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Auction</CardTitle>
              <CardDescription>
                Set up an auction for your artwork (beta)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('Auction creation coming soon!'); }}>
                <div>
                  <Label htmlFor="auction-artwork">Select Artwork</Label>
                  <select id="auction-artwork" className="w-full border rounded p-2" required>
                    <option value="">-- Select Artwork --</option>
                    {artworks.filter(a => a.status === 'FOR_SALE').map(a => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="auction-start">Start Time</Label>
                  <Input id="auction-start" type="datetime-local" required />
                </div>
                <div>
                  <Label htmlFor="auction-end">End Time</Label>
                  <Input id="auction-end" type="datetime-local" required />
                </div>
                <div>
                  <Label htmlFor="auction-price">Starting Price (₹)</Label>
                  <Input id="auction-price" type="number" min="0" required />
                </div>
                <Button type="submit" disabled>
                  Coming Soon
                </Button>
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
              {loadingArtworks ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading artworks...</span>
                </div>
              ) : artworks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You haven't uploaded any artworks yet.</p>
                  <p className="mt-2">Create your first artwork to start selling on Chitrakosha!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {artworks.map(artwork => (
                    <Card key={artwork.id} className="overflow-hidden">
                      <div className="relative h-48 w-full">
                        <Image 
                          src={artwork.imageUrl} 
                          alt={artwork.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold truncate">{artwork.title}</h4>
                          <Badge variant={artwork.status === 'FOR_SALE' ? 'default' : artwork.status === 'SOLD' ? 'secondary' : 'outline'}>
                            {artwork.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{artwork.description}</p>
                        <p className="font-bold text-lg">₹{artwork.price.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {formatDate(artwork.createdAt)}
                        </p>
                        <div className="flex space-x-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditArtwork(artwork)}
                            disabled={artwork.status === 'SOLD'}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteArtwork(artwork.id)}
                            disabled={artwork.status === 'SOLD'}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
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

      {/* Edit Artwork Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Artwork</DialogTitle>
            <DialogDescription>
              Update your artwork details
            </DialogDescription>
          </DialogHeader>
          
          {editingArtwork && (
            <form onSubmit={handleUpdateArtwork} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingArtwork.title}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingArtwork.description}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div>
                <FileUpload
                  onFileChange={(file) => setEditingArtworkFile(file)}
                  currentImageUrl={editingArtwork.imageUrl}
                  label="Update Primary Artwork Image"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a new primary image or keep the current one (JPG, PNG, GIF, SVG - max 5MB)
                </p>
              </div>
              <div>
                <MultiImageUpload
                  onImagesChange={(files) => setEditingArtworkImages(files)}
                  currentImages={editingArtwork.images || []}
                  maxImages={4}
                  label="Update Additional Images"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload new additional images or keep existing ones
                </p>
              </div>
              <div>
                <Label htmlFor="edit-price">Price (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingArtwork.price}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Updating...' : 'Update Artwork'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
