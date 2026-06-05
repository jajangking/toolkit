"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import AdSpace from "@/components/AdSpace";
import PertaminaReceipt from "@/components/PertaminaReceipt/PertaminaReceipt";
import { ReceiptData } from "@/components/PertaminaReceipt/types";
import { defaultReceiptData } from "@/components/PertaminaReceipt/defaultReceiptData";
import { exportToPNG, exportToPDF, printReceipt } from "@/components/PertaminaReceipt/printUtils";
import { processLogoUrl } from "@/components/PertaminaReceipt/logoProcessor";

export default function ReceiptGeneratorPage() {
  const [data, setData] = useState<ReceiptData>(defaultReceiptData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [originalLogo, setOriginalLogo] = useState<string | null>(null);
  const [logoThreshold, setLogoThreshold] = useState(128);
  const [logoDithering, setLogoDithering] = useState(false);
  const [logoSharpen, setLogoSharpen] = useState(true);
  const [logoScale, setLogoScale] = useState(100);
  const [processingLogo, setProcessingLogo] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingSegment, setEditingSegment] = useState<number>();
  const [showLogoSettings, setShowLogoSettings] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!originalLogo) return;
    let cancelled = false;
    setProcessingLogo(true);
    const baseW = 220;
    const baseH = 80;
    processLogoUrl(originalLogo, {
      threshold: logoThreshold,
      dithering: logoDithering,
      sharpen: logoSharpen,
      maxWidth: Math.round(baseW * logoScale / 100),
      maxHeight: Math.round(baseH * logoScale / 100),
    }).then((result) => {
      if (!cancelled) {
        setData((prev) => ({ ...prev, logo: result }));
        setProcessingLogo(false);
      }
    });
    return () => { cancelled = true; };
  }, [originalLogo, logoThreshold, logoDithering, logoSharpen, logoScale]);

  const updateField = useCallback(
    <K extends keyof ReceiptData>(section: K, value: ReceiptData[K]) => {
      setData((prev) => ({ ...prev, [section]: value }));
    },
    [],
  );

  const updateNestedField = useCallback(
    <S extends keyof ReceiptData>(section: S, field: string, value: string) => {
      setData((prev) => {
        const sectionData = prev[section];
        if (typeof sectionData === "object" && sectionData !== null) {
          return {
            ...prev,
            [section]: { ...(sectionData as any), [field]: value },
          };
        }
        return prev;
      });
    },
    [],
  );

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setOriginalLogo(url);
  }, []);

  const removeLogo = useCallback(() => {
    setOriginalLogo((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setData((prev) => ({ ...prev, logo: undefined }));
  }, []);

  const handleLineClick = useCallback(
    (_li: number, _si: number, _field: string | undefined, _text: string) => {
      setEditingIndex(_li);
      setEditingSegment(_si);
    },
    [],
  );

  const handleEditChange = useCallback(
    (_li: number, _si: number, field: string | undefined, value: string) => {
      if (!field) return;
      const trimmed = value.trim();
      const parts = field.split(".");
      if (parts[0] === "footer" && parts.length === 2) {
        setData((prev) => {
          const footer = [...prev.footer];
          footer[parseInt(parts[1])] = trimmed;
          return { ...prev, footer };
        });
      } else if (parts.length === 2) {
        updateNestedField(parts[0] as keyof ReceiptData, parts[1], trimmed);
      } else if (parts.length === 1) {
        updateField(parts[0] as keyof ReceiptData, trimmed as any);
      }
    },
    [updateNestedField, updateField],
  );

  const handleEditSave = useCallback(
    (_li: number, _si: number, field: string | undefined, value: string | undefined) => {
      if (value !== undefined && field) {
        handleEditChange(_li, _si, field, value);
      }
      setEditingIndex(null);
      setEditingSegment(undefined);
    },
    [handleEditChange],
  );

  const handleExportPNG = async () => {
    const el = receiptRef.current?.querySelector("[data-receipt-root]");
    if (el instanceof HTMLElement) {
      await exportToPNG(el);
    }
  };

  const handleExportPDF = async () => {
    const el = receiptRef.current?.querySelector("[data-receipt-root]");
    if (el instanceof HTMLElement) {
      await exportToPDF(el);
    }
  };

  const handlePrint = () => {
    const el = receiptRef.current?.querySelector("[data-receipt-root]");
    if (el instanceof HTMLElement) {
      printReceipt(el);
    }
  };

  const resetData = () => {
    setData(defaultReceiptData);
    setOriginalLogo((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setLogoThreshold(128);
    setLogoDithering(false);
    setLogoSharpen(true);
    setLogoScale(100);
    setEditingIndex(null);
    setEditingSegment(undefined);
  };

  const hasLogo = data.logo && typeof data.logo === "string" && data.logo.startsWith("data:image/");

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-white/95">
      {/* TOP BAR */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-black px-4 py-2 flex items-center gap-3 flex-wrap">
        <h1 className="text-sm font-black uppercase tracking-tight mr-auto">
          Receipt Generator
        </h1>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleLogoUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-[10px] font-black uppercase border-2 border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
        >
          {hasLogo ? "Ganti Logo" : "Logo"}
        </button>

        {processingLogo && (
          <span className="text-[10px] font-black uppercase opacity-60">...</span>
        )}

        {hasLogo && (
          <>
            <button
              onClick={() => setLogoScale((p) => Math.max(25, p - 10))}
              className="text-xs font-bold border border-black px-1.5 leading-none hover:bg-black hover:text-white transition-colors"
            >
              −
            </button>
            <span className="text-[10px] font-bold w-6 text-center">{logoScale}%</span>
            <button
              onClick={() => setLogoScale((p) => Math.min(150, p + 10))}
              className="text-xs font-bold border border-black px-1.5 leading-none hover:bg-black hover:text-white transition-colors"
            >
              +
            </button>
            <button
              onClick={() => setShowLogoSettings(!showLogoSettings)}
              className="text-[10px] font-black uppercase underline decoration-2"
            >
              {showLogoSettings ? "Sembunyi" : "Atur"}
            </button>
            <button
              onClick={removeLogo}
              className="text-[10px] font-black uppercase text-rose-500 underline decoration-2"
            >
              Hapus
            </button>
          </>
        )}

        <button
          onClick={resetData}
          className="text-[10px] font-black uppercase border-2 border-rose-400 text-rose-500 px-2 py-1 hover:bg-rose-400 hover:text-white transition-colors ml-2"
        >
          Reset
        </button>
      </div>

      {/* LOGO SETTINGS */}
      {showLogoSettings && hasLogo && (
        <div className="border-b-2 border-black bg-amber-50 px-4 py-3 space-y-2">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase cursor-pointer">
              <input
                type="checkbox"
                checked={logoDithering}
                onChange={(e) => setLogoDithering(e.target.checked)}
                className="w-3 h-3"
              />
              Dithering
            </label>
            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase cursor-pointer">
              <input
                type="checkbox"
                checked={logoSharpen}
                onChange={(e) => setLogoSharpen(e.target.checked)}
                className="w-3 h-3"
              />
              Sharpen
            </label>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black uppercase">Threshold:</label>
              <input
                type="range"
                min={0}
                max={255}
                value={logoThreshold}
                onChange={(e) => setLogoThreshold(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-[10px] font-bold w-6">{logoThreshold}</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN: RECEIPT */}
      <div className="px-4 py-6 flex flex-col items-center">
        {data.logo && typeof data.logo === "string" && !data.logo.startsWith("data:image/") && (
          <div className="text-[10px] font-black uppercase mb-2 opacity-60">
            Logo: {originalLogo ? "Memproses..." : "Teks"}
          </div>
        )}

        <div ref={receiptRef} className="w-full max-w-[300px]">
          <PertaminaReceipt
            data={data}
            editingIndex={editingIndex}
            editingSegment={editingSegment}
            onLineClick={handleLineClick}
            onEditChange={handleEditChange}
            onEditSave={handleEditSave}
          />
        </div>

        {/* EXPORT BUTTONS */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <button
            onClick={handleExportPNG}
            className="px-5 py-2.5 border-2 border-black bg-blue-400 hover:bg-blue-300 font-black uppercase text-xs transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            Export PNG
          </button>
          <button
            onClick={handleExportPDF}
            className="px-5 py-2.5 border-2 border-black bg-green-400 hover:bg-green-300 font-black uppercase text-xs transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            Export PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 border-2 border-black bg-amber-400 hover:bg-amber-300 font-black uppercase text-xs transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            Print Receipt
          </button>
        </div>
      </div>

      {/* AD SPACE */}
      <div className="px-4 pb-8">
        <AdSpace className="w-full" height="h-32 md:h-48" />
      </div>

      {/* FOOTER */}
      <div className="px-4 pb-8 flex justify-center">
        <Link
          href="/"
          className="text-sm font-black uppercase underline decoration-2 hover:text-amber-500 transition-colors"
        >
          Balik ke Beranda
        </Link>
      </div>
    </div>
  );
}
