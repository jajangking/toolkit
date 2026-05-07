import Link from "next/link";
import { notFound } from "next/navigation";
import { getTips } from "@/lib/tips";
import { getComments } from "@/lib/comments";
import AdSpace from "@/components/AdSpace";
import ReactionButtons from "@/components/ReactionButtons";
import CommentSection from "@/components/CommentSection";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const allTips = await getTips();
  const tip = allTips.find(t => t.slug === slug);
  if (!tip) return { title: "Not Found" };
  
  return {
    title: tip.title,
    description: tip.excerpt,
  };
}

export default async function TipDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const allTips = await getTips();
  const tip = allTips.find(t => t.slug === slug);

  if (!tip) notFound();

  // Karena comments.json juga akan bermasalah di Vercel,
  // untuk sementara kita tampilkan komentar kosong atau beri warning.
  // Tapi kita fokus perbaiki Tips dulu.
  const comments = getComments(tip.id);
  const solvedBy = allTips.filter(t => t.solvesId === tip.id);
  const solvesPost = allTips.find(t => t.id === tip.solvesId);

  return (
    <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/tips" className="inline-flex items-center text-xs font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
            <svg className="mr-2 w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            Kembali ke Daftar
          </Link>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID: {tip.id}</span>
        </div>

        <article className="animate-slide-up mb-12">
          <div className="mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-black px-2 py-0.5 neo-border mb-4 inline-block">
              {new Date(tip.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none dark:text-white text-black mb-6">
              {tip.title}
            </h1>
            
            {/* SOLVES INFO */}
            {solvesPost && (
              <div className="mb-6 p-4 bg-lime-400/20 neo-border border-dashed border-2 flex items-center gap-3">
                <span className="bg-lime-400 text-black px-2 py-0.5 text-[10px] font-black uppercase neo-border">SOLVED</span>
                <p className="text-sm font-bold">Artikel ini adalah solusi untuk: <Link href={`/tips/${solvesPost.slug}`} className="underline decoration-2">{solvesPost.title}</Link></p>
              </div>
            )}
          </div>

          <div className="liquid-glass neo-border neo-shadow p-8 md:p-12 bg-white/5 mb-8">
            <div className="prose prose-xl dark:prose-invert max-w-none font-medium leading-relaxed dark:text-gray-300 text-gray-800 whitespace-pre-wrap">
              {tip.content}
            </div>
          </div>

          {/* REACTION SECTION */}
          <div className="mb-12">
            <h4 className="text-sm font-black uppercase tracking-widest mb-4 opacity-50">Gimana menurut lo?</h4>
            <ReactionButtons tipId={tip.id} initialReactions={tip.reactions} />
          </div>

          {/* SOLVED BY INFO */}
          {solvedBy.length > 0 && (
            <div className="mb-12 p-6 bg-cyan-400/10 neo-border neo-shadow">
              <h4 className="text-xl font-black uppercase tracking-tighter mb-4">Masalah ini sudah ada solusinya:</h4>
              <div className="space-y-4">
                {solvedBy.map(s => (
                  <Link key={s.id} href={`/tips/${s.slug}`} className="flex items-center justify-between p-4 bg-white text-black neo-border hover:translate-x-1 transition-transform group">
                    <span className="font-bold">{s.title}</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* AD SPACE */}
        <div className="mb-16">
          <AdSpace className="w-full" label="SPONSORED CONTENT" />
        </div>

        {/* DISCUSSION SECTION */}
        <div className="mb-20">
          <CommentSection tipId={tip.id} initialComments={comments} />
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
