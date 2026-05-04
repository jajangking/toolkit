import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toolkit | Tool Digital Kece",
  description: "Kumpulan tool simpel, cepet, dan berani.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5291389837836056" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5291389837836056"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen flex flex-col relative transition-colors duration-300">
        <div className="bg-mesh" aria-hidden="true" />
        
        <header className="sticky top-0 z-50 px-4 py-4">
          <nav className="max-w-7xl mx-auto h-16 flex items-center justify-between liquid-glass neo-border neo-shadow-lg px-6 rounded-none">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-yellow-400 p-2 neo-border neo-shadow group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><rect width="18" height="18" x="3" y="3" rx="0"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter dark:text-white text-black transition-colors">Toolkit</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="px-3 py-1.5 md:px-4 md:py-2 font-bold text-black hover:bg-black hover:text-white transition-colors neo-border bg-white neo-shadow hidden sm:block text-sm">Beranda</Link>
              <Link href="/barcode" className="px-3 py-1.5 md:px-4 md:py-2 font-bold text-black hover:bg-black hover:text-white transition-colors neo-border bg-cyan-400 neo-shadow text-sm">Barcode</Link>
              <Link href="/scanner" className="px-3 py-1.5 md:px-4 md:py-2 font-bold text-black hover:bg-black hover:text-white transition-colors neo-border bg-purple-400 neo-shadow text-sm">Scanner</Link>
            </div>
          </nav>
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <footer className="py-8 px-4 mt-12">
          <div className="max-w-7xl mx-auto liquid-glass neo-border neo-shadow-lg p-6 flex flex-col md:flex-row justify-between items-center bg-white/10 animate-slide-up opacity-0 [animation-fill-mode:forwards] [animation-delay:0.4s]">
            <div className="text-lg font-black uppercase tracking-tight dark:text-white text-black transition-colors">Toolkit &copy; 2026</div>
            <div className="mt-4 md:mt-0 font-bold uppercase text-sm">
              <a 
                href="https://github.com/jajangking" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                <span>Github</span>
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
