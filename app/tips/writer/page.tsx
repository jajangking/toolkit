"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function WriterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [solvesId, setSolvesId] = useState("");
  const [tips, setTips] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch tips to populate the "Solves" dropdown
    const fetchTips = async () => {
      try {
        const res = await fetch("/tips"); // We can't fetch from server component tips easily, let's just fetch all tips if we had an API
        // For now, let's assume we might need a small API to list tips for the dropdown
      } catch (e) {}
    };
    // fetchTips();
    // Simplified: Just use a text input for ID for now, or fetch all from a new API
  }, []);

  if (status === "loading") return <div className="p-12 text-center font-black uppercase italic animate-pulse">Checking access...</div>;

  if (!session) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-4xl font-black mb-8 uppercase tracking-tighter">Admin Only</h1>
        <button onClick={() => signIn("google")} className="px-8 py-4 bg-white text-black neo-border neo-shadow font-black uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 transition-all">Login Admin</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, content, solvesId }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/tips/${data.slug}`);
      } else {
        setError(data.error || "Gagal simpan.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none dark:text-white text-black mb-4">
            TIPS WRITER
          </h1>
          <p className="text-lg font-bold italic dark:text-gray-400 text-gray-600">Tulis solusi hidup lo di sini, jajang!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="liquid-glass neo-border neo-shadow p-6 md:p-10 bg-white/5 space-y-6">
            <div className="space-y-2">
              <label className="block text-xl font-black uppercase tracking-tight">Judul Tips:</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Misal: Cara gue fix bug di kepala..."
                required
                className="w-full px-4 py-4 text-lg font-bold bg-white text-black neo-border neo-shadow focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xl font-black uppercase tracking-tight">Ringkasan (Excerpt):</label>
              <input 
                type="text" 
                value={excerpt} 
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Deskripsi singkat buat di kartu..."
                required
                className="w-full px-4 py-4 text-lg font-bold bg-white text-black neo-border neo-shadow focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xl font-black uppercase tracking-tight">Solusi Untuk Artikel ID (Optional):</label>
              <input 
                type="text" 
                value={solvesId} 
                onChange={(e) => setSolvesId(e.target.value)}
                placeholder="ID artikel masalah yang diselesaikan..."
                className="w-full px-4 py-4 text-lg font-bold bg-white text-black neo-border neo-shadow focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xl font-black uppercase tracking-tight">Konten Utama:</label>
              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis ceritanya di sini..."
                required
                rows={12}
                className="w-full px-4 py-4 text-lg font-bold bg-white text-black neo-border neo-shadow focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none resize-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-500 text-white font-black uppercase tracking-widest neo-border">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`flex-1 py-4 font-black uppercase tracking-widest neo-border neo-shadow transition-all ${isSubmitting ? 'bg-gray-400 opacity-50' : 'bg-yellow-400 text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}`}
              >
                {isSubmitting ? 'Lagi Simpan...' : 'Publish Sekarang'}
              </button>
              <Link href="/tips" className="flex-1 py-4 text-center bg-white text-black font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                Batalin
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
