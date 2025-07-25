import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

export function AuctionCreationForm({ artworks }: { artworks: Artwork[] }) {
  const [selectedArtwork, setSelectedArtwork] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forSaleArtworks = artworks.filter(a => a.status === 'FOR_SALE');
  const canSubmit = forSaleArtworks.length > 0 && selectedArtwork && startTime && endTime && startingPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworkId: selectedArtwork,
          startTime,
          endTime,
          startingPrice,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to create auction');
        return;
      }
      setSelectedArtwork('');
      setStartTime('');
      setEndTime('');
      setStartingPrice('');
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to create auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="auction-artwork">Select Artwork</Label>
        <select
          id="auction-artwork"
          className="w-full border rounded p-2"
          value={selectedArtwork}
          onChange={e => setSelectedArtwork(e.target.value)}
          required
        >
          <option value="">-- Select Artwork --</option>
          {forSaleArtworks.map(a => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="auction-start">Start Time</Label>
        <Input
          id="auction-start"
          type="datetime-local"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="auction-end">End Time</Label>
        <Input
          id="auction-end"
          type="datetime-local"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="auction-price">Starting Price (₹)</Label>
        <Input
          id="auction-price"
          type="number"
          min="0"
          value={startingPrice}
          onChange={e => setStartingPrice(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={!canSubmit || isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Auction'}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {forSaleArtworks.length === 0 && (
        <p className="text-sm text-muted-foreground mt-2">You must upload an artwork before creating an auction.</p>
      )}
    </form>
  );
}
