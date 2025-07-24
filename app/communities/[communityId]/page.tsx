"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CommunityMembership from './membership';
import PostEditor from './PostEditor';
import PostActions from './PostActions';
import CommentThread from './CommentThread';

function MemberList({ members }: { members: any[] }) {
  if (!members.length) return <div>No members yet.</div>;
  return (
    <div className="mb-6">
      <h3 className="font-bold mb-2">Members ({members.length})</h3>
      <ul className="list-disc ml-6">
        {members.map(m => (
          <li key={m.id}>{m.user?.name || 'User'}</li>
        ))}
      </ul>
    </div>
  );
}

function PostList({ posts, onUpdate }: { posts: any[]; onUpdate: () => void }) {
  if (!posts.length) return <div>No posts yet.</div>;
  return (
    <div>
      <h3 className="font-bold mb-2">Posts</h3>
      <ul className="space-y-2">
        {posts.map(post => (
          <li key={post.id} className="border rounded p-2">
            <div className="font-semibold">{post.title}</div>
            <div className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</div>
            <PostActions post={post} onUpdate={onUpdate} />
            <CommentThread postId={post.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CommunityDetailPage() {
  const { communityId } = useParams() as { communityId: string };
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/communities/${communityId}`)
      .then(res => res.json())
      .then(data => {
        setCommunity(data);
        setLoading(false);
      });
  }, [communityId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!community) return <div className="p-8">Community not found.</div>;

  function refresh() {
    setLoading(true);
    fetch(`/api/communities/${communityId}`)
      .then(res => res.json())
      .then(data => {
        setCommunity(data);
        setLoading(false);
      });
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">{community.name}</h1>
      <div className="mb-4 text-muted-foreground text-sm">Created: {new Date(community.createdAt).toLocaleDateString()}</div>
      <CommunityMembership initialMembers={community.members} />
      {/* Role-based permissions and member management UI can be added here */}
      <MemberList members={community.members} />
      <PostEditor communityId={communityId} onPost={refresh} />
      <PostList posts={community.posts} onUpdate={refresh} />
    </div>
  );
}
