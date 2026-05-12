"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import TipsActions from "@/components/TipsActions";

interface Tip {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
}

export default function TipsPage() {
  const { data: session, status } = useSession();
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const res = await fetch("/api/tips/public");
      const data = await res.json();
      setTips(data.tips || []);
    } catch (error) {
      console.error("Error fetching tips:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 animate-slide-up">
          <div className="inline-block bg-yellow-400 px-2 py-0.5 neo-border text-[10px] font-black uppercase tracking-widest mb-2 text-black transition-colors">Blog</div>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none dark:text-white text-black transition-colors">TIPS &<br/>PENGALAMAN</h1>
          <p className="mt-4 max-w-xl text-lg font-bold italic dark:text-gray-400 text-gray-600">
            Kumpulan catatan jujur tentang cara gue beresin masalah hidup. Semoga berguna buat lo juga.
          </p>
        </div>

        <TipsActions />

        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl font-bold animate-pulse">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {tips.length === 0 ? (
              <div className="liquid-glass neo-border neo-shadow p-12 text-center border-dashed border-4 border-black/10 dark:border-white/10">
                <p className="text-xl font-black uppercase tracking-tighter dark:text-white/30 text-black/30 italic">Belum ada catatan...</p>
              </div>
            ) : (
              tips.map((tip, index) => (
                <Link
                  key={tip.id}
                  href={`/tips/${tip.slug}`}
                  className="group liquid-glass neo-border neo-shadow p-6 md:p-10 bg-white/5 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all animate-slide-up opacity-0 [animation-fill-mode:forwards]"
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 neo-border">
                      {tip.date ? new Date(tip.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No date'}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 group-hover:underline decoration-4 dark:text-white text-black">
                    {tip.title}
                  </h2>
                  {tip.content?.trim().toLowerCase().startsWith('<!doctype') || tip.content?.trim().toLowerCase().startsWith('<html') ? (
                    <span className="inline-block mb-3 px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest neo-border">
                      Custom HTML Design
                    </span>
                  ) : null}
                  <p className="text-lg font-medium dark:text-gray-300 text-gray-700 leading-tight">
                    {tip.excerpt}
                  </p>
                  <div className="mt-6 flex items-center font-black uppercase tracking-widest text-xs dark:text-white text-black transition-colors">
                    <span>Baca Selengkapnya</span>
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="inline-block text-sm font-black uppercase underline decoration-2 hover:text-yellow-500 transition-colors">
            Balik ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
