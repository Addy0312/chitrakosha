"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const RazorpayCheckout = dynamic(() => import("@/components/payments/RazorpayCheckout"), { ssr: false });
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ImageGallery from '@/components/ui/ImageGallery';
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  images: string[];
  price: number;
  status: string;
  createdAt: string;
  category: string;
  artist: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function ArtworkDetailPage() {
  const params = useParams();
  const artworkId = params?.artworkId as string;
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [related, setRelated] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<any>(null);

  useEffect(() => {
    if (artworkId) fetchArtwork();
    // eslint-disable-next-line
  }, [artworkId]);

  async function fetchArtwork() {
    const res = await fetch(`/api/artworks/${artworkId}`);
    const data = await res.json();
    setArtwork(data);
    if (data?.artist?.id) fetchRelated(data.artist.id, data.id);
  }

  async function fetchRelated(artistId: string, excludeId: string) {
    const res = await fetch(`/api/artworks?artistId=${artistId}&limit=4`);
    const data = await res.json();
    setRelated((data.artworks || []).filter((a: Artwork) => a.id !== excludeId));
  }

  if (!artwork) return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading artwork...</div>;

  const images = [artwork.imageUrl, ...(artwork.images || [])].filter(Boolean);

  async function handleBuyNow() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setRazorpayOrder(null);
    try {
      const res = await fetch('/api/payments/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: artwork?.price, currency: 'INR' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create Razorpay order');
      setRazorpayOrder(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleRazorpaySuccess(response: any) {
    setSuccess(true);
    setRazorpayOrder(null);
    fetchArtwork();
  }

  function handleRazorpayFailure(error: any) {
    setError('Payment cancelled or failed.');
    setRazorpayOrder(null);
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div>
          <ImageGallery images={images} alt={artwork.title} />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl mb-2">{artwork.title}</CardTitle>
              <Badge className="mb-2 w-fit">{artwork.status}</Badge>
              <p className="text-muted-foreground mb-4">
                by {artwork.artist && artwork.artist.id ? (
                  <Link href={`/profile/${artwork.artist.id}`} className="underline">{artwork.artist.name}</Link>
                ) : (
                  <span>Unknown Artist</span>
                )}
              </p>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-lg">{artwork.description}</p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-foreground">₹{typeof artwork.price === 'number' ? artwork.price.toLocaleString("en-IN") : 'N/A'}</span>
                {razorpayOrder ? (
                  <RazorpayCheckout
                    orderId={razorpayOrder.id}
                    amount={artwork.price}
                    currency="INR"
                    onSuccess={handleRazorpaySuccess}
                    onFailure={handleRazorpayFailure}
                  />
                ) : (
                  <Button
                    size="lg"
                    className="bg-gradient-saffron hover:opacity-90"
                    disabled={loading || artwork.status !== 'FOR_SALE'}
                    onClick={handleBuyNow}
                  >
                    {loading ? 'Processing...' : artwork.status === 'FOR_SALE' ? 'Buy Now' : 'Not for Sale'}
                  </Button>
                )}
                {error && <div className="text-destructive mt-2">{error}</div>}
                {success && <div className="text-success mt-2">Payment successful! Check your profile for details.</div>}
              </div>
              <div className="flex items-center gap-3">
                    <ResponsiveImage 
                      src={artwork.artist && artwork.artist.image ? artwork.artist.image : '/placeholder.svg'} 
                      alt={artwork.artist && artwork.artist.name ? artwork.artist.name : 'Unknown Artist'} 
                      className="w-10 h-10 rounded-full object-cover border" 
                    />
                <span className="font-medium">{artwork.artist && artwork.artist.name ? artwork.artist.name : 'Unknown Artist'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">More by {artwork.artist.name}</h3>
        {related.length === 0 ? (
          <div className="text-muted-foreground">No other artworks by this artist.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(a => (
              <Card key={a.id} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                        <ResponsiveImage src={a.imageUrl} alt={a.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <Badge className="absolute top-4 left-4 bg-gradient-saffron">{a.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-base mb-1">{a.title}</CardTitle>
                  <p className="text-muted-foreground mb-2">by {a.artist.name}</p>
                  <span className="text-lg font-bold text-foreground">₹{a.price.toLocaleString("en-IN")}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import ResponsiveImage from '@/components/ui/ResponsiveImage';
