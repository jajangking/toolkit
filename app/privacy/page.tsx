export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="liquid-glass neo-border neo-shadow-lg p-8 bg-white/80 dark:bg-black/80">
        <h1 className="text-4xl font-black uppercase mb-8 border-b-4 border-black dark:border-white pb-2">Kebijakan Privasi</h1>
        
        <div className="space-y-6 font-bold text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-black uppercase mb-2">1. Informasi yang Kami Kumpulkan</h2>
            <p>Kami tidak mengumpulkan informasi identitas pribadi secara aktif kecuali Anda memberikannya kepada kami secara sukarela (misalnya melalui email). Kami menggunakan log standar untuk memantau trafik situs.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-2">2. Google AdSense</h2>
            <p>Situs ini menggunakan Google AdSense untuk menampilkan iklan. Google menggunakan cookie untuk menayangkan iklan berdasarkan kunjungan sebelumnya ke situs ini atau situs lain di internet.</p>
            <p className="mt-2">Penggunaan cookie iklan oleh Google memungkinkan Google dan mitranya untuk menayangkan iklan kepada pengguna berdasarkan kunjungan mereka ke situs Anda dan/atau situs lain di Internet.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-2">3. Cookie</h2>
            <p>Anda dapat memilih untuk menonaktifkan cookie melalui pengaturan browser Anda atau dengan mengelola preferensi dalam program keamanan seperti Norton Internet Security.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-2">4. Persetujuan</h2>
            <p>Dengan menggunakan situs kami, Anda dengan ini menyetujui Kebijakan Privasi kami dan menyetujui ketentuannya.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
