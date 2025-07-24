"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function CommunityMembership({ initialMembers }: { initialMembers: any[] }) {
  const { communityId } = useParams() as { communityId: string };
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is in initialMembers (SSR fallback)
    // In real app, fetch user session and check membership
    // For now, just set false
    setIsMember(false);
  }, [initialMembers]);

  async function join() {
    setLoading(true);
    await fetch(`/api/communities/${communityId}/join`, { method: 'POST' });
    setIsMember(true);
    setLoading(false);
  }
  async function leave() {
    setLoading(true);
    await fetch(`/api/communities/${communityId}/leave`, { method: 'POST' });
    setIsMember(false);
    setLoading(false);
  }

  return (
    <div className="mb-4">
      {isMember ? (
        <button className="btn btn-secondary" onClick={leave} disabled={loading}>
          Leave Community
        </button>
      ) : (
        <button className="btn btn-primary" onClick={join} disabled={loading}>
          Join Community
        </button>
      )}
    </div>
  );
}
