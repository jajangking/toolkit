"use client";

import { useState } from "react";

export default function CommentSection({ tipId, initialComments }: { tipId: string, initialComments: any[] }) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/tips/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipId, name, text }),
      });
      const data = await res.json();
      if (data.success) {
        setComments([...comments, data.comment]);
        setName("");
        setText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white text-black">Diskusi Pengunjung</h3>
      
      {/* FORM KOMENTAR */}
      <form onSubmit={handleSubmit} className="liquid-glass neo-border neo-shadow p-6 bg-white/5 space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-widest">Nama Lo:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonim..."
            required
            className="w-full px-4 py-2 font-bold bg-white text-black neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-widest">Komentar:</label>
          <textarea 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis pendapat lo di sini..."
            required
            rows={3}
            className="w-full px-4 py-2 font-bold bg-white text-black neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none resize-none"
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-3 font-black uppercase tracking-widest neo-border neo-shadow transition-all ${isSubmitting ? 'bg-gray-400 opacity-50' : 'bg-cyan-400 text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}`}
        >
          {isSubmitting ? 'Lagi Ngirim...' : 'Kirim Komentar'}
        </button>
      </form>

      {/* LIST KOMENTAR */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center italic font-bold text-gray-500">Belum ada diskusi. Jadilah yang pertama!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="liquid-glass neo-border neo-shadow p-6 bg-white/5 animate-scale-in">
              <div className="flex justify-between items-center mb-2">
                <span className="font-black uppercase tracking-tight text-yellow-500">{c.name}</span>
                <span className="text-[10px] font-bold text-gray-500">{new Date(c.date).toLocaleString('id-ID')}</span>
              </div>
              <p className="font-medium text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{c.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
