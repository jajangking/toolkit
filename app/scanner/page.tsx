"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Link from "next/link";

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
