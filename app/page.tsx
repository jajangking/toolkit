import Link from "next/link";
import AdSpace from "@/components/AdSpace";

export default async function Home() {
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
      title: "Scanner Ajaib",
      description: "Scan barcode pake kamera & ambil isinya.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
      ),
      href: "/scanner",
      color: "bg-purple-400",
    },
    {
      title: "Tips & Pengalaman",
      description: "Cara gue beresin masalah hidup yang mungkin berguna buat lo.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      ),
      href: "/tips",
      color: "bg-yellow-400",
    },
    {
      title: "Smart Notepad",
      description: "Catat & itung otomatis (10 + 20 jadi 30).",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      ),
      href: "/notepad",
      color: "bg-orange-400",
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
  ];

  return (
    <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <div className="mb-12 md:mb-20 text-center lg:text-left animate-slide-up flex flex-col lg:flex-row justify-between items-center lg:items-end gap-8">
          <div>
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4 dark:text-white text-black">
              SIMPLE.<br/>CEPET.<br/>BERANI.
            </h2>
            <p className="text-xl md:text-2xl font-bold uppercase italic dark:text-gray-400 text-gray-600">
              Kumpulan tool digital biar kerjaan lo makin sat-set.
            </p>
          </div>
          <AdSpace className="w-full lg:w-72 shrink-0 animate-scale-in" height="h-32 lg:h-48" label="ADS" />
        </div>

        {/* TOOL GRID */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-20">
          {tools.map((tool, index) => (
            <Link 
              key={index} 
              href={tool.href}
              className={`group relative liquid-glass neo-border neo-shadow p-5 md:p-8 h-full flex flex-col hover:translate-x-1 hover:translate-y-1 hover:shadow-none animate-slide-up opacity-0 [animation-fill-mode:forwards] transition-all duration-200 ${tool.status ? 'grayscale pointer-events-none opacity-60' : ''}`}
              style={{ animationDelay: `${(index + 2) * 0.1}s` }}
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
                  Cek Tool-nya 
                  <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* INFO SECTION TO INCREASE CONTENT VALUE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '0.8s' }}>
          <div className="liquid-glass neo-border neo-shadow p-8 bg-white/5">
            <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Kenapa Toolkit?</h4>
            <p className="text-lg font-medium dark:text-gray-300 text-gray-700 leading-relaxed">
              Kami bikin alat-alat ini buat bantu lo nyelesain tugas kecil yang sering bikin repot. Gak perlu install aplikasi berat, tinggal buka browser, semua beres dalam hitungan detik.
            </p>
          </div>
          <div className="liquid-glass neo-border neo-shadow p-8 bg-white/5">
            <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Privasi Utama</h4>
            <p className="text-lg font-medium dark:text-gray-300 text-gray-700 leading-relaxed">
              Data lo aman. Kita gak simpan teks barcode atau hasil scan lo di server kita. Khusus Notepad, sinkronisasi langsung ke Google Drive lo sendiri.
            </p>
          </div>
        </div>

        {/* SAFE AD SPACE BELOW CONTENT */}
        <div className="animate-slide-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '1s' }}>
          <AdSpace className="w-full" height="h-32 md:h-48" label="ADS" />
        </div>
      </div>
    </div>
  );
}
