export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="liquid-glass neo-border neo-shadow-lg p-8 bg-white/80 dark:bg-black/80">
        <h1 className="text-4xl font-black uppercase mb-8 border-b-4 border-black dark:border-white pb-2">Tentang Toolkit</h1>
        
        <div className="space-y-6 font-bold text-lg leading-relaxed">
          <p>
            Selamat datang di <span className="bg-yellow-400 px-1">Toolkit</span>, destinasi utama Anda untuk alat digital yang simpel, cepat, dan berani. 
            Kami percaya bahwa teknologi seharusnya mempermudah hidup, bukan malah merumitkannya.
          </p>

          <p>
            Misi kami adalah menyediakan koleksi alat digital gratis yang berkualitas tinggi—mulai dari generator barcode, 
            scanner QR, hingga notepad cerdas—semuanya dibungkus dalam desain neo-brutalism yang unik.
          </p>

          <section>
            <h2 className="text-2xl font-black uppercase mb-2">Kenapa Toolkit?</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Tanpa Registrasi: Langsung pakai, gak pake ribet.</li>
              <li>Privasi Terjamin: Kami tidak menyimpan data sensitif Anda.</li>
              <li>Desain Berani: Estetika modern untuk pengalaman yang berbeda.</li>
              <li>Gratis Selamanya: Semua fitur dasar kami bisa diakses tanpa biaya.</li>
            </ul>
          </section>

          <p>
            Dibuat dengan ❤️ di Indonesia untuk dunia digital yang lebih efisien.
          </p>
        </div>
      </div>
    </div>
  );
}
