"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function CameraSendPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const timerRef = useRef(0);
  const lastFpsRef = useRef(0);
  const fpsCountRef = useRef(0);

  // Room ID from URL param, fallback random
  const getRoomFromUrl = () => {
    if (typeof window === "undefined") return "";
    const p = new URLSearchParams(window.location.search);
    return p.get("room") || Math.random().toString(36).slice(2, 6).toUpperCase();
  };
  const [roomId, setRoomId] = useState(getRoomFromUrl);
  const statusRef = useRef<"idle" | "streaming" | "error">("idle");

  // QR code URL — the full projector page URL with room param
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const projectorUrl = `${baseUrl}/interactive-camera/projector?room=${roomId}`;

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 320 },
          height: { ideal: 240 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      setError(err?.message || "Gagal buka kamera");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera]);

  // Streaming loop: capture frame → POST to relay
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let lastPost = 0;

    const loop = async (time: number) => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        raf = requestAnimationFrame(loop);
        return;
      }

      // Throttle to ~15fps
      if (time - lastPost < 66) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastPost = time;

      canvas.width = 320;
      canvas.height = 240;
      ctx.drawImage(video, 0, 0, 320, 240);

      canvas.toBlob(
        async (blob) => {
          if (!blob) return;
          const reader = new FileReader();
          reader.onloadend = async () => {
            const b64 = (reader.result as string).split(",")[1];
            try {
              await fetch(`/api/camera-relay?room=${roomId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ frame: b64 }),
              });
            } catch { /* silently fail — connection issue */ }
          };
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.6,
      );

      fpsCountRef.current++;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    // FPS counter
    const fpsTimer = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastFpsRef.current) / 1000;
      setFps(Math.round(fpsCountRef.current / dt));
      fpsCountRef.current = 0;
      lastFpsRef.current = now;
    }, 2000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(fpsTimer);
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-[#121212] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <Link href="/interactive-camera" className="text-cyan-400 text-sm font-bold uppercase tracking-wider hover:underline">
          ← Back
        </Link>
        <h1 className="text-sm font-black uppercase tracking-widest">📷 Camera Sender</h1>
        <div />
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6">
        {/* Room ID */}
        <div className="bg-white/5 neo-border p-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Room ID</p>
          <p className="text-4xl font-black tracking-tighter text-cyan-400">{roomId}</p>
        </div>

        {/* QR Link */}
        <div className="flex justify-center">
          <div className="bg-white p-4 neo-border neo-shadow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(projectorUrl)}`}
              alt="QR for projector"
              width="200"
              height="200"
              className="block"
            />
          </div>
        </div>
        <p className="text-[10px] font-bold text-center text-gray-500 uppercase tracking-wider">
          Scan QR buka halaman di proyektor
        </p>

        {/* Camera preview */}
        <div className="relative">
          <video ref={videoRef} playsInline muted className="w-full neo-border bg-black" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 text-[10px] font-mono font-bold text-cyan-400">
            {streaming ? `▶ ${fps} fps` : "⏳ Starting..."}
          </div>
        </div>

        {/* Status */}
        {error && (
          <div className="bg-rose-500/10 neo-border p-4 text-center">
            <p className="font-bold text-rose-400 text-sm">{error}</p>
            <p className="text-[10px] text-gray-500 mt-2">
              Pastikan izin kamera diaktifkan
            </p>
          </div>
        )}

        <div className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider">
          Frame dikirim via relay — data gak disimpan
        </div>

        {/* Link to projector */}
        <div className="text-center">
          <Link
            href={projectorUrl}
            className="inline-block px-6 py-3 bg-cyan-400 text-black font-black uppercase tracking-wider text-sm neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            Buka Proyektor →
          </Link>
        </div>
      </main>
    </div>
  );
}
