"use client";
import { useState } from 'react';

export default function PostEditor({ communityId, onPost }: { communityId: string; onPost: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`/api/communities/${communityId}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create post');
    } else {
      setTitle('');
      setContent('');
      onPost();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <input
        type="text"
        className="input input-bordered w-full mb-2"
        placeholder="Post title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <textarea
        className="textarea textarea-bordered w-full mb-2"
        placeholder="Write your post..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={5}
        required
      />
      {/* Rich text editor can be integrated here */}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Posting...' : 'Post'}
      </button>
      {error && <div className="text-destructive mt-2">{error}</div>}
    </form>
  );
}
