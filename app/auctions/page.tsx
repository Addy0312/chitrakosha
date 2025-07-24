"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function getCountdown(endTime: string) {
  const end = new Date(endTime).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return 'Ended';
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export default function AuctionListingPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [sort, setSort] = useState('endTime');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchAuctions();
    const interval = setInterval(fetchAuctions, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [sort, order, filter]);

  async function fetchAuctions() {
    const res = await fetch(`/api/auctions/active?sort=${sort}&order=${order}`);
    const data = await res.json();
    setAuctions(
      filter
        ? data.filter((a: any) => a.artwork?.title?.toLowerCase().includes(filter.toLowerCase()))
        : data
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Active Auctions</h2>
      <div className="mb-4 flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search artwork..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="input input-bordered"
        />
        <select value={sort} onChange={e => setSort(e.target.value)} className="select select-bordered">
          <option value="endTime">Ending Soon</option>
          <option value="startTime">Recently Started</option>
        </select>
        <select value={order} onChange={e => setOrder(e.target.value as 'asc' | 'desc')} className="select select-bordered">
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map(auction => (
          <Link key={auction.id} href={`/auctions/${auction.id}`}>
            <Card className="hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardHeader>
                <CardTitle>{auction.artwork?.title || 'Auction'}</CardTitle>
                <Badge className="mb-2 w-fit">{getCountdown(auction.endTime)}</Badge>
              </CardHeader>
              <CardContent>
                <div>Current Bid: ₹{auction.currentBid || auction.startingBid}</div>
                <div>Ends: {new Date(auction.endTime).toLocaleString()}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
