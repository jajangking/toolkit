"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Link from "next/link";
import AdSpace from "@/components/AdSpace";

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Cleanup scanner pas komponen unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, []);

  const startScanner = () => {
    setIsScanning(true);
    setScanResult(null);

    // Kasih delay dikit biar div-nya render dulu
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          setScanResult(decodedText);
          setIsScanning(false);
          scanner.clear().catch(err => console.error(err));
        },
        () => {
          // Gak usah log error terus-terusan biar console bersih
        }
      );
      
      scannerRef.current = scanner;
    }, 100);
  };

  const copyToClipboard = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
      alert("Teks berhasil disalin!");
    }
  };

  return (
    <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col">
        
        {/* HEADER TOOL */}
        <div className="liquid-glass neo-border neo-shadow p-6 md:p-12 mb-8 bg-white/10 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
            <div>
              <div className="inline-block bg-purple-400 px-2 py-0.5 neo-border text-[10px] font-black uppercase tracking-widest mb-2 text-black transition-colors">Tool Keren</div>
              <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none dark:text-white text-black transition-colors">SCANNER<br/>AJAIB</h1>
            </div>
            <p className="max-w-xs text-sm md:text-lg font-bold leading-tight uppercase italic dark:text-gray-300 text-gray-800 transition-colors">Arahin kamera, langsung dapet isinya!</p>
          </div>

          {!isScanning && !scanResult && (
            <button 
              onClick={startScanner}
              className="w-full py-6 md:py-10 bg-yellow-400 text-black neo-border neo-shadow-lg text-2xl md:text-4xl font-black uppercase tracking-tighter hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Mulai Scan Sekarang
            </button>
          )}

          {isScanning && (
            <div className="animate-scale-in">
              <div id="reader" className="neo-border bg-white overflow-hidden shadow-inner"></div>
              <button 
                onClick={() => {
                  setIsScanning(false);
                  if (scannerRef.current) scannerRef.current.clear();
                }}
                className="mt-4 w-full py-3 bg-rose-500 text-white font-black uppercase neo-border neo-shadow"
              >
                Batalin Scan
              </button>
            </div>
          )}
        </div>

        {/* HASIL SCAN */}
        {scanResult && (
          <div className="liquid-glass neo-border neo-shadow p-6 md:p-12 bg-lime-400/20 animate-scale-in">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 dark:text-white text-black">Hasil Ekstrak:</h2>
            <div className="bg-white p-6 neo-border neo-shadow-lg mb-6">
              <p className="text-xl font-bold text-black break-all whitespace-pre-wrap">{scanResult}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={copyToClipboard}
                className="flex-1 py-4 bg-cyan-400 text-black font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Salin Teks
              </button>
              <button 
                onClick={startScanner}
                className="flex-1 py-4 bg-yellow-400 text-black font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Scan Lagi
              </button>
            </div>

            {scanResult.startsWith("http") && (
              <a 
                href={scanResult} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 block w-full text-center py-4 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Buka Link
              </a>
            )}
          </div>
        )}

        {/* EXPANDED EDUCATIONAL CONTENT */}
        <div className="mt-12 space-y-8 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="liquid-glass neo-border neo-shadow p-6 bg-white/5">
              <h4 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Cara Pakai Scanner</h4>
              <p className="text-sm font-medium dark:text-gray-300 text-gray-700 leading-relaxed mb-3">
                1. Klik tombol "Mulai Scan" di atas.<br/>
                2. Izinin akses kamera pas browser minta.<br/>
                3. Arahin kotak scanner ke Barcode atau QR Code.<br/>
                4. Hasil bakal otomatis muncul di bawah.
              </p>
              <p className="text-xs font-medium dark:text-gray-400 text-gray-600 leading-relaxed">
                <strong>Tips:</strong> Pastikan pencahayaan cukup dan kamera fokus ke kode. Jarak ideal sekitar 10-20cm dari layar atau kertas.
              </p>
            </div>
            <div className="liquid-glass neo-border neo-shadow p-6 bg-white/5">
              <h4 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Privasi Kamera</h4>
              <p className="text-sm font-medium dark:text-gray-300 text-gray-700 leading-relaxed mb-3">
                Tenang aja, kita gak rekam atau simpan video dari kamera lo. Semua proses scanning dilakuin langsung di browser (client-side), jadi data lo gak pernah dikirim ke server kita.
              </p>
              <p className="text-xs font-medium dark:text-gray-400 text-gray-600 leading-relaxed">
                Akses kamera hanya aktif saat lo scan, dan langsung dimatikan begitu hasil keluar. Zero data collection.
              </p>
            </div>
          </div>

          {/* USE CASES */}
          <div className="liquid-glass neo-border neo-shadow p-8 bg-gradient-to-br from-purple-400/10 to-pink-400/10">
            <h4 className="text-2xl font-black uppercase tracking-tighter mb-6 dark:text-white text-black">Kapan Lo Butuh Scanner?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">📱</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">Menu Digital</h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Scan QR menu di restoran atau kafe tanpa perlu pegang menu fisik.
                </p>
              </div>
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">🎫</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">Tiket & Voucher</h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Ambil kode promo atau link download dari poster atau brosur.
                </p>
              </div>
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">📦</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">Tracking Paket</h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Scan barcode resi pengiriman buat cek status paket lo.
                </p>
              </div>
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">💳</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">Pembayaran</h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Scan QR payment dari merchant atau temen buat transfer cepat.
                </p>
              </div>
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">📚</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">Info Produk</h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Scan barcode produk buat cek harga atau review online.
                </p>
              </div>
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">🔗</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">Link Cepat</h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Buka website atau download file tanpa perlu ngetik URL panjang.
                </p>
              </div>
            </div>
          </div>

          {/* TECHNICAL INFO */}
          <div className="liquid-glass neo-border neo-shadow p-6 bg-white/5">
            <h4 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Format yang Didukung</h4>
            <p className="text-sm font-medium dark:text-gray-300 text-gray-700 leading-relaxed mb-3">
              Scanner kami support berbagai format barcode dan QR code populer, termasuk:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
              <div className="bg-white/10 px-3 py-2 neo-border text-center">QR Code</div>
              <div className="bg-white/10 px-3 py-2 neo-border text-center">Code 128</div>
              <div className="bg-white/10 px-3 py-2 neo-border text-center">EAN-13</div>
              <div className="bg-white/10 px-3 py-2 neo-border text-center">UPC-A</div>
              <div className="bg-white/10 px-3 py-2 neo-border text-center">Code 39</div>
              <div className="bg-white/10 px-3 py-2 neo-border text-center">EAN-8</div>
              <div className="bg-white/10 px-3 py-2 neo-border text-center">ITF</div>
              <div className="bg-white/10 px-3 py-2 neo-border text-center">Data Matrix</div>
            </div>
          </div>
        </div>

        {/* CONDITIONAL AD SPACE - Only show when result is present to avoid "no content" policy */}
        {scanResult && (
          <div className="mt-12 animate-scale-in">
            <AdSpace className="w-full" height="h-32 md:h-48" />
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="inline-block text-sm font-black uppercase underline decoration-2 hover:text-cyan-500 transition-colors">
            Balik ke Beranda
          </Link>
        </div>
      </div>
      
      <style jsx global>{`
        #reader__dashboard_section_swaplink { display: none !important; }
        #reader__status_span { font-family: 'Space Grotesk', sans-serif !important; font-weight: bold !important; text-transform: uppercase !important; }
        button.html5-qrcode-element { 
          background: #000 !important; 
          color: #fff !important; 
          border: 2px solid #000 !important;
          padding: 8px 16px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          cursor: pointer !important;
          margin: 5px !important;
        }
        select.html5-qrcode-element {
          padding: 8px !important;
          border: 2px solid #000 !important;
          font-weight: bold !important;
          margin: 5px !important;
        }
      `}</style>
    </div>
  );
}
