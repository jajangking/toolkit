"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Comment {
  id: string;
  tipId: string;
  parentId: string | null;
  name: string;
  email: string;
  text: string;
  date: string;
  votes: number;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'baru saja';
  if (m < 60) return `${m} menit lalu`;
  if (h < 24) return `${h} jam lalu`;
  return `${d} hari lalu`;
}

function CommentItem({
  comment,
  allComments,
  session,
  tipId,
  depth = 0,
  onNewComment,
}: {
  comment: Comment;
  allComments: Comment[];
  session: any;
  tipId: string;
  depth?: number;
  onNewComment: (c: Comment) => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [votes, setVotes] = useState(comment.votes || 0);
  const [voted, setVoted] = useState<1 | -1 | null>(null);

  const replies = allComments.filter(c => c.parentId === comment.id);

  const handleVote = async (dir: 1 | -1) => {
    if (!session || voted !== null) return;
    setVoted(dir);
    setVotes(v => v + dir);
    await fetch('/api/tips/comments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId: comment.id, dir }),
    });
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !session) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/tips/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipId, text: replyText, parentId: comment.id }),
      });
      const data = await res.json();
      if (data.success) {
        onNewComment(data.comment);
        setReplyText('');
        setShowReply(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`flex gap-2 ${depth > 0 ? 'mt-3' : 'mt-6'}`}>
      {/* Thread line */}
      {depth > 0 && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-5 flex-shrink-0 flex justify-center cursor-pointer group"
        >
          <div className="w-0.5 bg-gray-300 dark:bg-gray-600 group-hover:bg-yellow-400 transition-colors h-full" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-black text-sm text-yellow-500">{comment.name}</span>
          <span className="text-xs text-gray-500">{timeAgo(comment.date)}</span>
          {depth === 0 && (
            <button onClick={() => setCollapsed(!collapsed)} className="text-xs text-gray-400 hover:text-gray-600 ml-auto">
              {collapsed ? '▶ show' : '▼ hide'}
            </button>
          )}
        </div>

        {!collapsed && (
          <>
            {/* Content */}
            <p className="font-medium dark:text-gray-300 text-gray-800 whitespace-pre-wrap text-sm mb-2">
              {comment.text}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 text-xs">
              {/* Vote */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleVote(1)}
                  disabled={!session || voted !== null}
                  className={`font-black px-1 hover:text-yellow-500 transition-colors disabled:opacity-40 ${voted === 1 ? 'text-yellow-500' : ''}`}
                >
                  ▲
                </button>
                <span className={`font-black min-w-[1.5rem] text-center ${votes > 0 ? 'text-yellow-500' : votes < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {votes}
                </span>
                <button
                  onClick={() => handleVote(-1)}
                  disabled={!session || voted !== null}
                  className={`font-black px-1 hover:text-red-500 transition-colors disabled:opacity-40 ${voted === -1 ? 'text-red-500' : ''}`}
                >
                  ▼
                </button>
              </div>

              {/* Reply */}
              {session && depth < 5 && (
                <button
                  onClick={() => setShowReply(!showReply)}
                  className="font-black uppercase tracking-wide text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  💬 Reply
                </button>
              )}

              {/* Reply count */}
              {replies.length > 0 && (
                <span className="text-gray-400">{replies.length} reply</span>
              )}
            </div>

            {/* Reply form */}
            {showReply && session && (
              <form onSubmit={handleReply} className="mt-3 space-y-2">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Balas ${comment.name}...`}
                  rows={2}
                  required
                  className="w-full px-3 py-2 text-sm font-bold bg-white text-black neo-border focus:translate-x-0.5 focus:translate-y-0.5 transition-all outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 bg-yellow-400 text-black font-black uppercase text-xs neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Kirim'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReply(false)}
                    className="px-4 py-1.5 bg-white text-black font-black uppercase text-xs neo-border hover:bg-gray-100 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}

            {/* Nested replies */}
            {replies.length > 0 && (
              <div className="mt-2">
                {replies.map(reply => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    allComments={allComments}
                    session={session}
                    tipId={tipId}
                    depth={depth + 1}
                    onNewComment={onNewComment}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ tipId }: { tipId: string; initialComments?: any[] }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) fetchComments();
    else setLoading(false);
  }, [session, tipId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/tips/comments?tipId=${tipId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewComment = (c: Comment) => {
    setComments(prev => [...prev, c]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !session) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/tips/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipId, text }),
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => [...prev, data.comment]);
        setText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Hanya komentar root (tanpa parentId)
  const rootComments = comments
    .filter(c => !c.parentId)
    .sort((a, b) => b.votes - a.votes); // sort by votes

  const totalComments = comments.length;

  return (
    <div className="space-y-6">
      <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white text-black">
        Diskusi <span className="text-yellow-400">{totalComments > 0 ? `(${totalComments})` : ''}</span>
      </h3>

      {/* Form komentar utama */}
      {session ? (
        <form onSubmit={handleSubmit} className="liquid-glass neo-border neo-shadow p-6 bg-white/5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase text-gray-500">Komen sebagai</span>
            <span className="font-black text-sm text-yellow-500">{session.user?.name}</span>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Tulis komentar kamu..."
            required
            rows={3}
            className="w-full px-4 py-2 font-bold bg-white text-black neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 font-black uppercase tracking-widest neo-border neo-shadow transition-all ${submitting ? 'bg-gray-400 opacity-50' : 'bg-yellow-400 text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}`}
          >
            {submitting ? 'Sending...' : 'Kirim Komentar'}
          </button>
        </form>
      ) : (
        <div className="liquid-glass neo-border neo-shadow p-6 text-center bg-white/5">
          <p className="font-bold mb-4 text-gray-500">Login untuk ikut diskusi</p>
          <Link href="/login" className="inline-block px-6 py-3 bg-yellow-400 text-black font-black uppercase neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            Login dengan Google
          </Link>
        </div>
      )}

      {/* List komentar */}
      <div className="divide-y-2 divide-black/5 dark:divide-white/5">
        {loading ? (
          <p className="text-center italic font-bold text-gray-500 animate-pulse py-8">Loading diskusi...</p>
        ) : rootComments.length === 0 ? (
          <p className="text-center italic font-bold text-gray-500 py-8">Belum ada diskusi. Jadilah yang pertama!</p>
        ) : (
          rootComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              allComments={comments}
              session={session}
              tipId={tipId}
              depth={0}
              onNewComment={handleNewComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
