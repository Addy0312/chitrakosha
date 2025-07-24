"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuctionDetailPage() {
  const params = useParams();
  const auctionId = params?.auctionId as string;
  const [auction, setAuction] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (auctionId) fetchAuction();
    const interval = setInterval(fetchAuction, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [auctionId]);

  async function fetchAuction() {
    const res = await fetch(`/api/auctions/${auctionId}/state`);
    const data = await res.json();
    setAuction(data);
    if (data.endTime) updateCountdown(data.endTime);
  }

  function updateCountdown(endTime: string) {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) setTimeLeft('Auction ended');
    else {
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs}s`);
    }
  }

  async function placeBid() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(bidAmount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bid failed');
      setSuccess(true);
      setBidAmount('');
      fetchAuction();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!auction) return <div className="p-8">Loading auction...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{auction.artwork?.title || 'Auction'}</CardTitle>
          <div className="text-muted-foreground">Ends in: {timeLeft}</div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">Current Bid: ₹{auction.currentBid || auction.startingBid}</div>
          <input
            type="number"
            value={bidAmount}
            onChange={e => setBidAmount(e.target.value)}
            className="input input-bordered mr-2"
            placeholder="Enter your bid"
            min={auction.currentBid ? auction.currentBid + 1 : auction.startingBid}
            disabled={loading || timeLeft === 'Auction ended'}
          />
          <Button onClick={placeBid} disabled={loading || timeLeft === 'Auction ended'}>
            {loading ? 'Placing Bid...' : 'Place Bid'}
          </Button>
          {error && <div className="text-destructive mt-2">{error}</div>}
          {success && <div className="text-success mt-2">Bid placed!</div>}
          <div className="mt-8">
            <h3 className="font-bold mb-2">Recent Bids</h3>
            <ul>
              {auction.bids?.map((bid: any) => (
                <li key={bid.id}>
                  ₹{bid.amount} by {bid.user?.name || 'User'} at {new Date(bid.createdAt).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
