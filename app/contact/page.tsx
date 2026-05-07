export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="liquid-glass neo-border neo-shadow-lg p-8 bg-white/80 dark:bg-black/80">
        <h1 className="text-4xl font-black uppercase mb-8 border-b-4 border-black dark:border-white pb-2">Hubungi Kami</h1>
        
        <div className="space-y-6 font-bold text-lg leading-relaxed">
          <p>Ada saran, kritik, atau pertanyaan? Jangan ragu buat colek gue!</p>
          
          <div className="grid gap-4">
            <div className="p-4 bg-cyan-400 neo-border neo-shadow">
              <h3 className="font-black uppercase">Email</h3>
              <p>halo@jajangking.com</p>
            </div>
            
            <div className="p-4 bg-purple-400 neo-border neo-shadow">
              <h3 className="font-black uppercase">GitHub</h3>
              <p>github.com/jajangking</p>
            </div>

            <div className="p-4 bg-yellow-400 neo-border neo-shadow">
              <h3 className="font-black uppercase">Instagram</h3>
              <p>@jajangking_dev</p>
            </div>
          </div>

          <p className="italic text-sm">*Gue biasanya bales dalam 1-2 hari kerja. Kalo gak dibales, mungkin gue lagi burnout.</p>
        </div>
      </div>
    </div>
  );
}
