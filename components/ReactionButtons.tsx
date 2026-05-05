"use client";

import { useState } from "react";

const REACTION_EMOJIS = {
  like: "👍",
  love: "❤️",
  haha: "😆",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

export default function ReactionButtons({ tipId, initialReactions }: { tipId: string, initialReactions?: any }) {
  const [reactions, setReactions] = useState(initialReactions || { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 });
  const [loading, setLoading] = useState(false);

  const handleReaction = async (type: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tips/reactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipId, reactionType: type }),
      });
      const data = await res.json();
      if (data.success) {
        setReactions(data.reactions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 md:gap-4 p-4 liquid-glass neo-border bg-white/5">
      {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
        <button
          key={type}
          onClick={() => handleReaction(type)}
          disabled={loading}
          className="group flex items-center gap-2 px-3 py-1.5 bg-white text-black neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          <span className="text-xl group-hover:scale-125 transition-transform">{emoji}</span>
          <span className="font-black text-xs">{reactions[type] || 0}</span>
        </button>
      ))}
    </div>
  );
}
