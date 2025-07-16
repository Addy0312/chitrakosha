'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export default function ArtistDashboardPage() {
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

  const handleAddArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    setArtworks([...artworks, { id: artworks.length + 1, ...newArtwork }]);
    setNewArtwork({ title: '', description: '', imageUrl: '', price: '', });
  };

  const handleDeleteArtwork = (id: number) => {
    setArtworks(artworks.filter(artwork => artwork.id !== id));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Artist Dashboard</h2>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload New Artwork</CardTitle>
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
        </CardHeader>
        <CardContent>
          {artworks.length === 0 ? (
            <p>You haven't uploaded any artworks yet.</p>
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
    </div>
  );
}
