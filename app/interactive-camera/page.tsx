"use client";

import InteractiveCamera from "@/components/InteractiveCamera/InteractiveCamera";
import Link from "next/link";

export default function InteractiveCameraPage() {
  return (
    <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="inline-block bg-fuchsia-400 px-2 py-0.5 neo-border text-[10px] font-black uppercase tracking-widest mb-2 text-black">
            Projection Mapping
          </div>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none dark:text-white text-black">
            CAMERA
            <br />
            INTERAKTIF
          </h1>
          <p className="mt-4 max-w-xl text-lg font-bold italic dark:text-gray-400 text-gray-600">
            Kamera deteksi objek di depan proyektor &mdash; bola virtual mantul pas kena
            benda. HP sebagai kamera, tembok jadi dunia interaktif!
          </p>
        </div>

        {/* Mode selector */}
        <div className="mb-8 flex flex-wrap gap-4 animate-slide-up">
          <Link
            href="/interactive-camera/projector"
            className="px-6 py-3 bg-cyan-400 text-black font-black uppercase tracking-wider text-sm neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            🖥 Mode Proyektor
          </Link>
          <Link
            href="/interactive-camera/send"
            className="px-6 py-3 bg-violet-400 text-black font-black uppercase tracking-wider text-sm neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            📱 Kirim dari HP
          </Link>
        </div>

        {/* Main component */}
        <InteractiveCamera />

        {/* Educational content */}
        <div className="mt-12 space-y-8 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="liquid-glass neo-border neo-shadow p-6 bg-white/5">
              <h4 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">
                Cara Pakai
              </h4>
              <div className="space-y-3 text-sm font-medium dark:text-gray-300 text-gray-700">
                <p>
                  <strong className="text-black dark:text-white">
                    1. Calibrate:
                  </strong>{" "}
                  Klik &quot;Calibrate BG&quot; pas tembok kosong. Biar sistem
                  kenali background.
                </p>
                <p>
                  <strong className="text-black dark:text-white">
                    2. Taruh Objek:
                  </strong>{" "}
                  Angkat benda di depan tembok (tangan, botol, buku, apapun).
                </p>
                <p>
                  <strong className="text-black dark:text-white">
                    3. Start:
                  </strong>{" "}
                  Klik &quot;Start&quot; — bola bakal muncul dan mantul-mantul
                  kena objek lo!
                </p>
                <p>
                  <strong className="text-black dark:text-white">
                    4. Setup:
                  </strong>{" "}
                  Pilih &quot;IP Camera&quot; — masukin URL HP lo (pake app IP Webcam).
                  Proyektor colok ke laptop, fullscreen browser.
                </p>
              </div>
            </div>
            <div className="liquid-glass neo-border neo-shadow p-6 bg-white/5">
              <h4 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">
                Tips & Tricks
              </h4>
              <div className="space-y-3 text-sm font-medium dark:text-gray-300 text-gray-700">
                <p>
                  <strong className="text-black dark:text-white">
                    Lighting:
                  </strong>{" "}
                  Pencahayaan merata biar deteksi objek akurat. Hindari
                  bayangan tajam.
                </p>
                <p>
                  <strong className="text-black dark:text-white">
                    Background:
                  </strong>{" "}
                  Meja polos (putih/hitam) biar objek keliatan kontras. Hindari
                  meja motif.
                </p>
                <p>
                  <strong className="text-black dark:text-white">
                    Threshold:
                  </strong>{" "}
                  Geser slider threshold kalo deteksi terlalu sensitif atau
                  kurang sensitif.
                </p>
                <p>
                  <strong className="text-black dark:text-white">
                    Debug:
                  </strong>{" "}
                  Aktifin &quot;Show Debug&quot; buat liat bounding box deteksi
                  objek.
                </p>
              </div>
            </div>
          </div>

          {/* Use cases */}
          <div className="liquid-glass neo-border neo-shadow p-8 bg-gradient-to-br from-fuchsia-400/10 to-cyan-400/10">
            <h4 className="text-2xl font-black uppercase tracking-tighter mb-6 dark:text-white text-black">
              Ide Interaksi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">🎯</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">
                  Target Game
                </h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Bola harus kena objek tertentu buat dapet skor. Susun rintangan
                  dari benda fisik.
                </p>
              </div>
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">🎨</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">
                  Particle Lab
                </h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Partikel mengalir kena objek, pecah atau berubah warna. Efek
                  visual buat pameran.
                </p>
              </div>
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">📊</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">
                  Data Physical
                </h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Obek fisik representasi data — interactive dashboard yang
                  bisa lo sentuh.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block text-sm font-black uppercase underline decoration-2 hover:text-fuchsia-500 transition-colors"
          >
            Balik ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
