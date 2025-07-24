import { useEffect, useState } from 'react';

export default function BidsHistory({ auctionId }: { auctionId: string }) {
  const [bids, setBids] = useState<any[]>([]);
  useEffect(() => {
    fetch(`/api/auctions/${auctionId}/bids`)
      .then(res => res.json())
      .then(data => setBids(data.bids || []));
  }, [auctionId]);
  if (!bids.length) return <div>No bids yet.</div>;
  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2">Bid History</h3>
      <ul>
        {bids.map(bid => (
          <li key={bid.id}>
            ₹{bid.amount} by {bid.user?.name || 'User'} at {new Date(bid.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
