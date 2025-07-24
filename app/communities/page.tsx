"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const CreateCommunity = dynamic(() => import('./CreateCommunity'), { ssr: false });

function CommunityCard({ community }: { community: any }) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      <h2 className="font-bold text-lg mb-1">{community.name}</h2>
      <div className="text-muted-foreground text-sm mb-2">Created: {new Date(community.createdAt).toLocaleDateString()}</div>
      {/* Add more preview info here if needed */}
    </div>
  );
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCommunities();
    // eslint-disable-next-line
  }, []);

  async function fetchCommunities(query = '') {
    setLoading(true);
    const res = await fetch(`/api/communities?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    setCommunities(data);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchCommunities(search);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Communities</h1>
      <CreateCommunity onCreate={() => fetchCommunities()} />
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search communities..."
          className="input input-bordered flex-1"
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map(community => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      )}
      {!loading && !communities.length && <div>No communities found.</div>}
    </div>
  );
}
