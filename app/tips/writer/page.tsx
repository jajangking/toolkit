"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function WriterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [result, setResult] = useState("");
  const [solvesId, setSolvesId] = useState("");
  const [tips, setTips] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        <h1 className="text-4xl font-black mb-8 uppercase tracking-tighter">Login untuk Menulis</h1>
        <p className="mb-8 text-lg">Siapa saja bisa menulis artikel di Toolkit!</p>
        <Link href="/login?callbackUrl=/tips/writer" className="inline-block px-8 py-4 bg-white text-black neo-border neo-shadow font-black uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 transition-all">
          Login dengan Google
        </Link>
      </div>
    );
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "jajangnurdiana123@gmail.com";
  const isAdmin = session.user?.email?.toLowerCase() === adminEmail.toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    // Auto-generate excerpt from content if not provided
    const finalExcerpt = excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';

    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt: finalExcerpt, content, problem, solution, result, solvesId }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(data.message);
        // Clear form
        setTitle("");
        setExcerpt("");
        setContent("");
        setProblem("");
        setSolution("");
        setResult("");
        setSolvesId("");

        // Redirect after 2 seconds
        setTimeout(() => {
          if (data.status === 'approved') {
            router.push(`/tips/${data.slug}`);
          } else {
            router.push('/tips');
          }
        }, 2000);
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
          <p className="text-lg font-bold italic dark:text-gray-400 text-gray-600">
            {isAdmin ? "Admin: Artikel langsung publish!" : "Artikel akan direview admin sebelum publish"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="liquid-glass neo-border neo-shadow p-6 md:p-10 bg-white/5 space-y-6">
            <div className="space-y-2">
              <label className="block text-xl font-black uppercase tracking-tight">Judul Artikel:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Misal: Cara Mengatasi Error 404 di Next.js"
                required
                className="w-full px-4 py-4 text-lg font-bold bg-white text-black neo-border neo-shadow focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xl font-black uppercase tracking-tight">Konten Artikel:</label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Tulis konten lengkap artikel di sini..."
              />
              <p className="text-sm dark:text-gray-400 text-gray-600 italic">
                Gunakan toolbar untuk format text, tambah gambar, dan link
              </p>
            </div>

            <details className="liquid-glass neo-border p-4">
              <summary className="font-black uppercase cursor-pointer">Opsional: Tambah Ringkasan & Struktur</summary>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="block font-bold">Ringkasan (Excerpt):</label>
                  <input
                    type="text"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Deskripsi singkat untuk preview..."
                    className="w-full px-4 py-3 font-bold bg-white text-black neo-border focus:translate-x-0.5 focus:translate-y-0.5 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-bold">Masalah (Problem):</label>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Apa masalah yang dihadapi?"
                    rows={3}
                    className="w-full px-4 py-3 font-bold bg-white text-black neo-border focus:translate-x-0.5 focus:translate-y-0.5 transition-all outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-bold">Solusi (Solution):</label>
                  <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Bagaimana cara menyelesaikannya?"
                    rows={4}
                    className="w-full px-4 py-3 font-bold bg-white text-black neo-border focus:translate-x-0.5 focus:translate-y-0.5 transition-all outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-bold">Hasil (Result):</label>
                  <textarea
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    placeholder="Apa hasilnya setelah diterapkan?"
                    rows={3}
                    className="w-full px-4 py-3 font-bold bg-white text-black neo-border focus:translate-x-0.5 focus:translate-y-0.5 transition-all outline-none resize-none"
                  />
                </div>
              </div>
            </details>

            {successMessage && (
              <div className="p-4 bg-green-500 text-white font-black uppercase tracking-widest neo-border">
                {successMessage}
              </div>
            )}

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
                {isSubmitting ? 'Lagi Simpan...' : (isAdmin ? 'Publish Sekarang' : 'Submit untuk Review')}
              </button>
              <Link href="/tips" className="flex-1 py-4 text-center bg-white text-black font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                Batalin
              </Link>
            </div>
          </div>
        </form>

        {isAdmin && (
          <div className="mt-8 p-6 bg-purple-100 neo-border neo-shadow">
            <h2 className="text-2xl font-black uppercase mb-2">Admin Panel</h2>
            <p className="mb-4">Kamu adalah admin. Artikel kamu langsung publish!</p>
            <Link href="/tips/admin" className="inline-block px-6 py-3 bg-purple-600 text-white font-black uppercase neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 transition-all">
              Lihat Pending Articles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
