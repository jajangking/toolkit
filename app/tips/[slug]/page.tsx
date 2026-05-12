"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Tip } from "@/lib/tips";
import dynamic from "next/dynamic";

const ReactionButtons = dynamic(() => import("@/components/ReactionButtons"), { ssr: false });
const CommentSection = dynamic(() => import("@/components/CommentSection"), { ssr: false });

export default function TipDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const slug = params.slug as string;

  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    fetchTip();
  }, [slug]);

  const fetchTip = async () => {
    try {
      const res = await fetch("/api/tips/public");
      const data = await res.json();
      const tips: Tip[] = data.tips || [];
      const found = tips.find(t => t.slug === slug);
      if (!found) {
        setNotFoundState(true);
      } else {
        setTip(found);
      }
    } catch (error) {
      console.error("Error fetching tip:", error);
      setNotFoundState(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl font-bold animate-pulse">Loading...</p>
      </div>
    );
  }

  if (notFoundState || !tip) {
    return (
      <div className="py-20 text-center px-4">
        <h1 className="text-3xl font-black uppercase mb-4">Artikel Tidak Ditemukan</h1>
        <Link href="/tips" className="inline-block px-6 py-3 bg-black text-white font-black uppercase neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          Kembali ke Tips
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/tips" className="inline-flex items-center text-xs font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
            <svg className="mr-2 w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            Kembali ke Daftar
          </Link>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">By {tip.author}</span>
        </div>

        <article className="animate-slide-up mb-12">
          <div className="mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-black px-2 py-0.5 neo-border mb-4 inline-block">
              {tip.date ? new Date(tip.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none dark:text-white text-black mb-6">
              {tip.title}
            </h1>
          </div>

          <div className="liquid-glass neo-border neo-shadow p-8 md:p-12 bg-white/5 mb-8">
            <div
              className="prose prose-xl dark:prose-invert max-w-none font-medium leading-relaxed dark:text-gray-300 text-gray-800"
              dangerouslySetInnerHTML={{ __html: tip.content }}
            />
          </div>

          {(tip.problem || tip.solution || tip.result) && (
            <div className="space-y-4 mb-8">
              {tip.problem && (
                <div className="p-6 neo-border neo-shadow bg-red-500/10">
                  <h3 className="font-black uppercase text-sm mb-2">Problem</h3>
                  <p className="font-medium">{tip.problem}</p>
                </div>
              )}
              {tip.solution && (
                <div className="p-6 neo-border neo-shadow bg-green-500/10">
                  <h3 className="font-black uppercase text-sm mb-2">Solution</h3>
                  <p className="font-medium">{tip.solution}</p>
                </div>
              )}
              {tip.result && (
                <div className="p-6 neo-border neo-shadow bg-blue-500/10">
                  <h3 className="font-black uppercase text-sm mb-2">Result</h3>
                  <p className="font-medium">{tip.result}</p>
                </div>
              )}
            </div>
          )}

          <div className="mb-12">
            <h4 className="text-sm font-black uppercase tracking-widest mb-4 opacity-50">Gimana menurut lo?</h4>
            <ReactionButtons tipId={tip.id} initialReactions={tip.reactions} />
          </div>
        </article>

        <div className="mb-20">
          <CommentSection tipId={tip.id} initialComments={[]} />
        </div>

        <div className="text-center pt-8 border-t-4 border-black/10 dark:border-white/10">
          <Link href="/tips" className="inline-block text-sm font-black uppercase underline decoration-2 hover:text-yellow-500 transition-colors">
            Lihat Tips Lainnya
          </Link>
        </div>
      </div>
    </div>
  );
}
