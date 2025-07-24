"use client";
import { useState } from 'react';

export default function PostActions({ post, onUpdate }: { post: any; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEdit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`/api/communities/${post.communityId}/posts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, title, content }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to update post');
    } else {
      setEditing(false);
      onUpdate();
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    setError('');
    const res = await fetch(`/api/communities/${post.communityId}/posts`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to delete post');
    } else {
      onUpdate();
    }
    setLoading(false);
  }

  if (editing) {
    return (
      <form onSubmit={handleEdit} className="mb-2">
        <input
          type="text"
          className="input input-bordered w-full mb-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          className="textarea textarea-bordered w-full mb-2"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          required
        />
        <button type="submit" className="btn btn-primary mr-2" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)} disabled={loading}>
          Cancel
        </button>
        {error && <div className="text-destructive mt-2">{error}</div>}
      </form>
    );
  }

  return (
    <div className="flex gap-2 mt-1">
      <button className="btn btn-xs btn-outline" onClick={() => setEditing(true)}>
        Edit
      </button>
      <button className="btn btn-xs btn-outline btn-error" onClick={handleDelete} disabled={loading}>
        Delete
      </button>
      {error && <div className="text-destructive mt-2">{error}</div>}
    </div>
  );
}
