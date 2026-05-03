import Link from "next/link";

export default function Home() {
  const tools = [
    {
      title: "Barcode & QR",
      description: "Bikin QR & Barcode instan buat teks atau URL.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M3 17v2a2 2 0 0 1 2 2h2"/><rect x="7" y="7" width="10" height="10" rx="0"/></svg>
      ),
      href: "/barcode",
      color: "bg-cyan-400",
    },
    {
      title: "Password Gen",
      description: "Bikin password kuat biar akun lo aman.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><rect width="18" height="11" x="3" y="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      ),
      href: "#",
      color: "bg-lime-400",
      status: "SABAR",
    },
    {
      title: "Unit Conv",
      description: "Konversi satuan panjang, berat, suhu.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="m8 2 4 4 4-4"/><path d="M12 20v-6"/><path d="m16 22-4-4-4 4"/><path d="M12 4v6"/></svg>
      ),
      href: "#",
      color: "bg-rose-400",
      status: "SABAR",
    },
  ];

  return (
    <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-12 md:mb-20 text-center lg:text-left animate-slide-up">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <h1 className="text-6xl md:text-9xl font-black uppercase leading-none tracking-tighter dark:text-white text-black mb-4 transition-colors">
            NEO<br/><span className="text-transparent dark:text-white" style={{ WebkitTextStroke: '1.5px currentColor' }}>TOOLKIT</span>
          </h1>
          <div className="inline-block bg-yellow-400 px-4 py-2 neo-border neo-shadow transform -rotate-1">
            <p className="text-lg md:text-2xl font-black uppercase tracking-tight text-black">
              Tool Satset Buat Lo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => (
            <Link 
              key={index} 
              href={tool.href}
              style={{ animationDelay: `${index * 0.1}s` }}
              className={`group relative liquid-glass neo-border neo-shadow p-5 md:p-8 h-full flex flex-col hover:translate-x-1 hover:translate-y-1 hover:shadow-none animate-slide-up opacity-0 [animation-fill-mode:forwards] ${tool.status ? 'grayscale pointer-events-none opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 flex items-center justify-center neo-border neo-shadow ${tool.color} group-hover:bg-white transition-colors text-black`}>
                  {tool.icon}
                </div>
                {tool.status && (
                  <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">{tool.status}</span>
                )}
              </div>
              
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 group-hover:underline decoration-2 dark:text-white text-black transition-colors">
                {tool.title}
              </h3>
              <p className="text-sm md:text-lg font-medium leading-tight dark:text-gray-300 text-gray-800 flex-grow transition-colors">
                {tool.description}
              </p>
              
              <div className="mt-6 flex items-center font-black uppercase tracking-widest text-xs dark:text-white text-black transition-colors">
                <span className="flex items-center">
                  Buka Tool 
                  <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
