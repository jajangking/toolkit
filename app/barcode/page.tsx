"use client";

import { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from "react";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";
import AdSpace from "@/components/AdSpace";
import Link from "next/link";

type BarcodeFormat = "CODE128" | "CODE39" | "EAN13" | "EAN8" | "UPC" | "ITF14" | "pharmacode";

class BarcodeErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Barcode crash caught:", error, errorInfo); }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default function BarcodePage() {
  const [text, setText] = useState("");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [isLoaded, setIsLoaded] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<"qr" | "barcode" | null>(null);

  useEffect(() => {
    const savedText = localStorage.getItem("last_barcode_text");
    const savedFormat = localStorage.getItem("last_barcode_format") as BarcodeFormat;
    
    const loadData = () => {
      if (savedText) setText(savedText);
      if (savedFormat) setFormat(savedFormat);
      setIsLoaded(true);
    };

    const timer = setTimeout(loadData, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("last_barcode_text", text);
      localStorage.setItem("last_barcode_format", format);
    }
  }, [text, format, isLoaded]);

  const isValidEANChecksum = (code: string) => {
    if (!/^\d+$/.test(code)) return false;
    if (code.length === 13) {
      let sum = 0;
      for (let i = 0; i < 12; i++) sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
      return ((10 - (sum % 10)) % 10) === parseInt(code[12]);
    }
    return true;
  };

  const isValidInput = useMemo(() => {
    if (!text) return true;
    switch (format) {
      case "EAN13": return /^\d{12,13}$/.test(text) && isValidEANChecksum(text);
      case "EAN8": return /^\d{7,8}$/.test(text);
      case "UPC": return /^\d{11,12}$/.test(text);
      case "ITF14": return /^\d{13,14}$/.test(text);
      case "pharmacode": return /^\d+$/.test(text) && parseInt(text) >= 3 && parseInt(text) <= 131070;
      default: return true;
    }
  }, [text, format]);

  // Logika "Satset" biar Barcode SELALU muat di layar (Auto-Fit)
  const getDynamicWidth = (isZoomed: boolean) => {
    if (!text) return 2;
    const len = text.length;
    const baseWidth = isZoomed ? 2.5 : 1.5;
    
    // Makin panjang teks, makin kecil bar-nya biar gak kepotong
    if (len > 40) return isZoomed ? 0.7 : 0.4;
    if (len > 25) return isZoomed ? 1.0 : 0.6;
    if (len > 15) return isZoomed ? 1.5 : 0.9;
    
    return baseWidth;
  };

  const barcodeFormats: { value: BarcodeFormat; label: string; hint: string }[] = [
    { value: "CODE128", label: "CODE 128 (Umum)", hint: "Bisa huruf & angka" },
    { value: "CODE39", label: "CODE 39", hint: "Huruf kapital & angka" },
    { value: "EAN13", label: "EAN-13 (Retail)", hint: "12/13 angka & checksum valid" },
    { value: "EAN8", label: "EAN-8", hint: "Harus 7-8 digit angka" },
    { value: "UPC", label: "UPC", hint: "Harus 11-12 digit angka" },
    { value: "ITF14", label: "ITF-14", hint: "Harus 13-14 digit angka" },
    { value: "pharmacode", label: "Pharmacode", hint: "Angka (3 - 131070)" },
  ];

  const currentFormatInfo = barcodeFormats.find(f => f.value === format);

  if (!isLoaded) return null;

  return (
    <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col">
        
        {/* HASIL / OUTPUT */}
        <div className="order-1 mb-8 min-h-[300px] md:min-h-[400px] flex flex-col justify-center animate-scale-in opacity-0 [animation-fill-mode:forwards]">
          {text ? (
            <div className="grid grid-cols-2 gap-4 md:gap-10 h-full items-stretch">
              <div onClick={() => setZoomTarget("qr")} className="liquid-glass neo-border neo-shadow p-4 md:p-8 flex flex-col items-center justify-between bg-blue-400/20 group cursor-zoom-in hover:-translate-y-1 transition-transform">
                <h3 className="w-full text-xs md:text-xl font-black uppercase tracking-tighter mb-4 md:mb-6 dark:text-white text-black transition-colors">Format QR</h3>
                <div className="bg-white p-2 md:p-4 neo-border neo-shadow w-full aspect-square flex items-center justify-center group-hover:rotate-1 transition-transform">
                  <QRCode value={text} size={256} viewBox={`0 0 256 256`} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                </div>
                <p className="mt-4 text-[8px] md:text-xs font-black uppercase tracking-widest bg-white px-2 py-0.5 md:py-1 neo-border text-black">Tap buat Zoom</p>
              </div>

              <div onClick={() => isValidInput && setZoomTarget("barcode")} className={`liquid-glass neo-border neo-shadow p-4 md:p-8 flex flex-col items-center justify-between group transition-transform ${isValidInput ? 'bg-lime-400/20 cursor-zoom-in hover:-translate-y-1' : 'bg-rose-400/20 cursor-not-allowed'}`}>
                <h3 className="w-full text-xs md:text-xl font-black uppercase tracking-tighter mb-4 md:mb-6 dark:text-white text-black transition-colors overflow-hidden text-ellipsis whitespace-nowrap">{format}</h3>
                <div className="bg-white p-2 md:p-4 neo-border neo-shadow w-full flex items-center justify-center overflow-hidden h-full min-h-[80px] md:min-h-[120px] transition-all">
                  <BarcodeErrorBoundary key={`${text}-${format}`} fallback={<p className="text-[10px] font-black text-rose-500">ERROR</p>}>
                    {isValidInput ? (
                      <div className="group-hover:-rotate-1 transition-transform flex items-center justify-center w-full overflow-hidden">
                        <Barcode value={text} format={format} width={getDynamicWidth(false)} height={60} fontSize={10} font="Space Grotesk" background="#ffffff" />
                      </div>
                    ) : (
                      <div className="text-center p-2">
                        <p className="text-[10px] md:text-xs font-black text-rose-500 uppercase leading-tight transition-colors">Gak Valid</p>
                        <p className="text-[8px] md:text-[10px] font-bold text-gray-400 mt-1 uppercase transition-colors">{currentFormatInfo?.hint}</p>
                      </div>
                    )}
                  </BarcodeErrorBoundary>
                </div>
                <p className="mt-4 text-[8px] md:text-xs font-black uppercase tracking-widest bg-white px-2 py-0.5 md:py-1 neo-border text-black">{isValidInput ? 'Tap buat Zoom' : 'Input Error'}</p>
              </div>
            </div>
          ) : (
            <div className="liquid-glass neo-border neo-shadow p-12 text-center border-dashed border-4 border-black/10 dark:border-white/10 h-full flex flex-col justify-center">
              <p className="text-xl font-black uppercase tracking-tighter dark:text-white/30 text-black/30 transition-colors italic">Nunggu lo ngetik...</p>
            </div>
          )}
        </div>

        {/* INPUT PANEL */}
        <div className="order-2 liquid-glass neo-border neo-shadow p-6 md:p-12 bg-white/10 animate-slide-up opacity-0 [animation-fill-mode:forwards] [animation-delay:0.2s]">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
            <div>
              <div className="inline-block bg-cyan-400 px-2 py-0.5 neo-border text-[10px] font-black uppercase tracking-widest mb-2 text-black transition-colors">Tool Berguna</div>
              <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none dark:text-white text-black transition-colors">BARCODE<br/>GEN</h1>
            </div>
            <p className="max-w-xs text-sm md:text-lg font-bold leading-tight uppercase italic dark:text-gray-300 text-gray-800 transition-colors">Dijamin muat di layar & bisa di-scan!</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="text-input" className="block text-lg font-black uppercase tracking-tight dark:text-white text-black transition-colors">Masukin Data / URL:</label>
              <input id="text-input" type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis di sini..." autoFocus className={`w-full px-4 py-4 text-lg font-bold bg-white neo-border neo-shadow focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none text-black ${!isValidInput && text ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`} />
              {!isValidInput && text && <p className="text-xs font-black text-rose-500 uppercase tracking-tight mt-1 animate-pulse transition-colors">⚠️ {currentFormatInfo?.hint}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="format-select" className="block text-lg font-black uppercase tracking-tight dark:text-white text-black transition-colors transition-colors">Tipe Barcode:</label>
              <select id="format-select" value={format} onChange={(e) => setFormat(e.target.value as BarcodeFormat)} className="w-full px-4 py-3 font-bold bg-white neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black cursor-pointer appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'3\' stroke-linecap=\'square\'%3e%3cpath d=\'M6 9l6 6 6-6\'/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}>
                {barcodeFormats.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            {text && <button onClick={() => setText("")} className="text-[10px] font-black uppercase underline decoration-2 hover:text-rose-500 transition-colors">Hapus Semua</button>}
          </div>
        </div>

        {/* EXPANDED EDUCATIONAL CONTENT */}
        <div className="order-3 mt-12 space-y-8 animate-slide-up opacity-0 [animation-fill-mode:forwards] [animation-delay:0.4s]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="liquid-glass neo-border neo-shadow p-6 bg-white/5">
              <h4 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Tentang Format Barcode</h4>
              <ul className="space-y-3 text-sm font-medium dark:text-gray-300 text-gray-700">
                <li><strong className="text-black dark:text-white">CODE 128:</strong> Paling populer, bisa simpan huruf, angka, dan simbol. Cocok buat inventory dan shipping.</li>
                <li><strong className="text-black dark:text-white">EAN-13:</strong> Standar internasional buat barang retail/toko. Wajib punya checksum digit yang valid.</li>
                <li><strong className="text-black dark:text-white">QR Code:</strong> Bisa simpan ribuan karakter, cocok buat URL, vCard, atau WiFi credentials.</li>
                <li><strong className="text-black dark:text-white">UPC:</strong> Standar Amerika buat produk retail, mirip EAN tapi 12 digit.</li>
              </ul>
            </div>
            <div className="liquid-glass neo-border neo-shadow p-6 bg-white/5">
              <h4 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Tips Scan & Print</h4>
              <p className="text-sm font-medium dark:text-gray-300 text-gray-700 leading-relaxed mb-3">
                Pastiin kontras warna cukup (hitam di atas putih paling bagus). Kalo barcode kepanjangan, kita otomatis kecilin ukurannya biar tetep muat di layar hp lo saat di-scan.
              </p>
              <p className="text-xs font-medium dark:text-gray-400 text-gray-600 leading-relaxed">
                <strong>Print Quality:</strong> Minimal 300 DPI buat hasil terbaik. Hindari print di kertas glossy yang bisa bikin pantulan cahaya.
              </p>
            </div>
          </div>

          {/* USE CASES */}
          <div className="liquid-glass neo-border neo-shadow p-8 bg-gradient-to-br from-cyan-400/10 to-blue-400/10">
            <h4 className="text-2xl font-black uppercase tracking-tighter mb-6 dark:text-white text-black">Kapan Lo Butuh Barcode Generator?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">🏪</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">Toko & UMKM</h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Bikin barcode produk buat sistem kasir atau inventory. Cetak dan tempel di packaging.
                </p>
              </div>
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">📲</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">Share Link</h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Bikin QR code buat website, Instagram, atau WhatsApp lo. Tempel di brosur atau kartu nama.
                </p>
              </div>
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">🎉</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">Event & Undangan</h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Bikin QR buat link RSVP, lokasi Google Maps, atau form registrasi acara lo.
                </p>
              </div>
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">📦</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">Shipping Label</h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Generate barcode buat nomor resi atau tracking number paket kiriman.
                </p>
              </div>
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">🎫</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">Tiket Digital</h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Bikin QR code unik buat tiket konser, seminar, atau workshop lo.
                </p>
              </div>
              <div className="bg-white/10 p-4 neo-border">
                <div className="text-3xl mb-2">📱</div>
                <h5 className="text-sm font-black uppercase mb-2 dark:text-white text-black">WiFi QR</h5>
                <p className="text-xs font-medium dark:text-gray-300 text-gray-700">
                  Bikin QR WiFi biar tamu bisa connect tanpa ngetik password panjang.
                </p>
              </div>
            </div>
          </div>

          {/* TECHNICAL GUIDE */}
          <div className="liquid-glass neo-border neo-shadow p-6 bg-white/5">
            <h4 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Panduan Teknis</h4>
            <div className="space-y-4 text-sm font-medium dark:text-gray-300 text-gray-700">
              <div>
                <h5 className="font-black text-black dark:text-white mb-2">Ukuran Minimum</h5>
                <p className="text-xs leading-relaxed">
                  Barcode: minimal 1 inch (2.5cm) lebar. QR Code: minimal 2x2 cm buat scan jarak dekat, 5x5 cm buat jarak jauh.
                </p>
              </div>
              <div>
                <h5 className="font-black text-black dark:text-white mb-2">Quiet Zone</h5>
                <p className="text-xs leading-relaxed">
                  Kasih ruang kosong minimal 0.25 inch di kiri-kanan barcode. Jangan sampai ada teks atau gambar yang terlalu deket.
                </p>
              </div>
              <div>
                <h5 className="font-black text-black dark:text-white mb-2">Testing</h5>
                <p className="text-xs leading-relaxed">
                  Selalu test barcode lo pake scanner atau kamera HP sebelum cetak massal. Pastikan bisa kebaca dari berbagai jarak dan sudut.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONDITIONAL AD SPACE */}
        {text && (
          <div className="order-4 mt-12 animate-scale-in">
            <AdSpace className="w-full" height="h-32 md:h-48" />
          </div>
        )}

        <div className="order-5 mt-12 text-center">
          <Link href="/" className="inline-block text-sm font-black uppercase underline decoration-2 hover:text-cyan-500 transition-colors">
            Balik ke Beranda
          </Link>
        </div>
      </div>

      {/* ZOOM MODAL */}
      {zoomTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-scale-in transition-all" onClick={() => setZoomTarget(null)}>
          <div className="liquid-glass neo-border neo-shadow-lg p-6 md:p-12 bg-white flex flex-col items-center w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoomTarget(null)} className="absolute top-4 right-4 bg-rose-500 text-white p-2 neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all z-10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            <div className="bg-white p-4 md:p-10 neo-border neo-shadow-lg mb-8 w-full flex items-center justify-center overflow-hidden">
              {zoomTarget === "qr" ? (
                <div className="p-2"><QRCode value={text} size={400} style={{ height: "auto", maxWidth: "100%", width: "min(400px, 80vw)" }} /></div>
              ) : (
                <div className="py-10 px-2 w-full flex items-center justify-center overflow-hidden">
                  <BarcodeErrorBoundary key={`${text}-${format}`} fallback={<p className="text-xl font-black text-rose-500">FORMAT ERROR!</p>}>
                    {isValidInput && (
                      <div className="w-full flex justify-center">
                         {/* Barcode dipaksa mengecil kalo kepanjangan biar tetep bisa di-scan */}
                        <Barcode value={text} format={format} width={getDynamicWidth(true)} height={150} fontSize={18} font="Space Grotesk" background="#ffffff" />
                      </div>
                    )}
                  </BarcodeErrorBoundary>
                </div>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-black transition-colors">{zoomTarget === "qr" ? "QR CODE" : format}</h2>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors">Siap di-scan • Klik luar buat tutup</p>
          </div>
        </div>
      )}
    </div>
  );
}
