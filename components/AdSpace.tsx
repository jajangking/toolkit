"use client";

import { useEffect } from "react";

interface AdSpaceProps {
  label?: string;
  className?: string;
  height?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSpace({ 
  label = "SPONSORED SPACE", 
  className = "", 
  height = "h-32" 
}: AdSpaceProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Adsbygoogle error:", e);
    }
  }, []);

  return (
    <div className={`relative liquid-glass neo-border neo-shadow flex flex-col items-center justify-center overflow-hidden bg-white/10 ${height} ${className}`}>
      {/* Label Iklan Gaya Neo-Brutalism */}
      <div className="absolute top-0 left-0 bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] z-10">
        {label}
      </div>

      <div className="flex flex-col items-center gap-2 text-black/30 dark:text-white/30 group">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="square"
          className="group-hover:scale-110 transition-transform"
        >
          <rect x="2" y="2" width="20" height="20" rx="0" />
          <path d="M7 7l10 10M17 7L7 17" />
        </svg>
        <span className="text-[10px] font-black uppercase tracking-widest italic">Cuan Loading...</span>
      </div>

      {/* AdSense Unit */}
      <div className="w-full h-full flex items-center justify-center">
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', height: '100%' }}
             data-ad-client="ca-pub-5291389837836056"
             data-ad-slot="auto"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    </div>
  );
}
