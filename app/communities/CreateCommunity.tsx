"use client";
import { useState } from 'react';

export default function CreateCommunity({ onCreate }: { onCreate: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/communities/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create community');
    } else {
      setName('');
      setDescription('');
      onCreate();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <input
        type="text"
        className="input input-bordered w-full mb-2"
        placeholder="Community name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <textarea
        className="textarea textarea-bordered w-full mb-2"
        placeholder="Description (min 10 characters)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
        minLength={10}
      />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Creating...' : 'Create Community'}
      </button>
      {error && <div className="text-destructive mt-2">{error}</div>}
    </form>
  );
}
