import Link from "next/link";
import { notFound } from "next/navigation";
import { getTipBySlug } from "@/lib/tips";
import AdSpace from "@/components/AdSpace";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const tip = getTipBySlug(slug);
  if (!tip) return { title: "Not Found" };
  
  return {
    title: tip.title,
    description: tip.excerpt,
  };
}

export default async function TipDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tip = getTipBySlug(slug);

  if (!tip) notFound();

  return (
    <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/tips" className="inline-flex items-center text-xs font-black uppercase tracking-widest mb-8 hover:translate-x-[-4px] transition-transform">
          <svg className="mr-2 w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          Kembali ke Daftar
        </Link>

        <article className="animate-slide-up">
          <div className="mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-black px-2 py-0.5 neo-border mb-4 inline-block">
              {new Date(tip.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none dark:text-white text-black mb-6">
              {tip.title}
            </h1>
          </div>

          <div className="liquid-glass neo-border neo-shadow p-8 md:p-12 bg-white/5 mb-12">
            <div className="prose prose-xl dark:prose-invert max-w-none font-medium leading-relaxed dark:text-gray-300 text-gray-800 whitespace-pre-wrap">
              {tip.content}
            </div>
          </div>
        </article>

        {/* AD SPACE FOR COMPLIANCE */}
        <div className="mb-12">
          <AdSpace className="w-full" label="SPONSORED CONTENT" />
        </div>

        <div className="text-center pt-8 border-t-4 border-black/10 dark:border-white/10">
          <p className="font-bold italic dark:text-gray-500 text-gray-400 mb-4">Punya masalah serupa? Sharing yuk di kolom komentar (coming soon)!</p>
          <Link href="/tips" className="inline-block text-sm font-black uppercase underline decoration-2 hover:text-yellow-500 transition-colors">
            Lihat Tips Lainnya
          </Link>
        </div>
      </div>
    </div>
  );
}
