"use client";
import { useEffect, useState } from 'react';

function CommentForm({ postId, parentId, onComment }: { postId: string; parentId?: string; onComment: () => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`/api/communities/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, parentId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to comment');
    } else {
      setText('');
      onComment();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-2">
      <textarea
        className="textarea textarea-bordered w-full mb-2"
        placeholder="Write a comment..."
        value={text}
        onChange={e => setText(e.target.value)}
        rows={2}
        required
      />
      <button type="submit" className="btn btn-sm btn-primary" disabled={loading}>
        {loading ? 'Posting...' : 'Comment'}
      </button>
      {error && <div className="text-destructive mt-2">{error}</div>}
    </form>
  );
}

function renderComments(comments: any[], postId: string, onComment: () => void, parentId: string | null = null) {
  return comments
    .filter(c => c.parentId === parentId)
    .map(comment => (
      <div key={comment.id} className="ml-4 border-l pl-2 mt-2">
        <div className="font-semibold text-sm">{comment.author?.name || 'User'}</div>
        <div className="text-sm mb-1">{comment.text}</div>
        <div className="text-xs text-muted-foreground mb-1">{new Date(comment.createdAt).toLocaleString()}</div>
        <CommentForm postId={postId} parentId={comment.id} onComment={onComment} />
        {renderComments(comments, postId, onComment, comment.id)}
      </div>
    ));
}

export default function CommentThread({ postId }: { postId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchComments() {
    setLoading(true);
    fetch(`/api/communities/${postId}/comments`)
      .then(res => res.json())
      .then(data => {
        setComments(data.comments || []);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [postId]);

  return (
    <div className="mt-4">
      <h4 className="font-bold mb-2">Comments</h4>
      <CommentForm postId={postId} onComment={fetchComments} />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>{renderComments(comments, postId, fetchComments)}</div>
      )}
      {!loading && !comments.length && <div>No comments yet.</div>}
    </div>
  );
}
