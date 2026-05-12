"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const REACTION_EMOJIS: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😆",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

export default function ReactionButtons({ tipId, initialReactions }: { tipId: string, initialReactions?: any }) {
  const { data: session } = useSession();
  const [reactions, setReactions] = useState(initialReactions || { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 });
  const [loading, setLoading] = useState<string | null>(null);
  const [voted, setVoted] = useState<string | null>(null);

  const handleReaction = async (type: string) => {
    if (!session) return;
    if (loading || voted) return;
    setLoading(type);
    try {
      const res = await fetch("/api/tips/reactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipId, reactionType: type }),
      });
      const data = await res.json();
      if (data.success) {
        setReactions(data.reactions);
        setVoted(type);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  if (!session) {
    return (
      <div className="p-4 liquid-glass neo-border bg-white/5">
        <p className="text-sm font-bold mb-3 text-gray-500">
          <Link href="/login" className="text-yellow-500 underline font-black">Login</Link> untuk kasih reaksi
        </p>
        <div className="flex flex-wrap gap-2 opacity-50 pointer-events-none">
          {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
            <div key={type} className="flex items-center gap-2 px-3 py-1.5 bg-white text-black neo-border">
              <span className="text-xl">{emoji}</span>
              <span className="font-black text-xs">{reactions[type] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 md:gap-4 p-4 liquid-glass neo-border bg-white/5">
      {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
        <button
          key={type}
          onClick={() => handleReaction(type)}
          disabled={!!loading || !!voted}
          className={`group flex items-center gap-2 px-3 py-1.5 neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all
            ${voted === type ? 'bg-yellow-400 text-black' : 'bg-white text-black'}
            ${voted && voted !== type ? 'opacity-50' : ''}
            disabled:cursor-not-allowed`}
        >
          <span className={`text-xl ${loading === type ? 'animate-bounce' : 'group-hover:scale-125 transition-transform'}`}>{emoji}</span>
          <span className="font-black text-xs">{reactions[type] || 0}</span>
        </button>
      ))}
      {voted && <p className="w-full text-xs font-bold text-gray-500 mt-1">Reaksi kamu sudah disimpan!</p>}
    </div>
  );
}
