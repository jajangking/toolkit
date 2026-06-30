"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Hook: Load MJPEG stream via <img> (browser auto-updates).
 * Returns grab functions for both processing (proc-sized) and display (full-sized).
 */
export function useMjpegStream(
  url: string,
  onFirstFrame?: (w: number, h: number) => void,
) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fIdRef = useRef(0);
  const szRef = useRef({ w: 640, h: 480 });
  const cbRef = useRef(onFirstFrame);
  cbRef.current = onFirstFrame;

  const connect = useCallback((u: string) => {
    if (!u.trim()) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    imgRef.current = img;
    const id = ++fIdRef.current;

    img.onload = () => {
      if (id !== fIdRef.current) return;
      // Trigger first frame draw so we can read natural dimensions
      const c = document.createElement("canvas");
      c.width = img.naturalWidth || 640;
      c.height = img.naturalHeight || 480;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      szRef.current = { w: c.width, h: c.height };
      cbRef.current?.(c.width, c.height);
    };

    img.onerror = () => {
      if (id !== fIdRef.current) return;
      setTimeout(() => {
        if (id === fIdRef.current) {
          img.src = u + (u.includes("?") ? "&" : "?") + "t=" + Date.now();
        }
      }, 2000);
    };

    img.src = u;
  }, []);

  useEffect(() => {
    connect(url);
    return () => {
      fIdRef.current++;
      if (imgRef.current) {
        imgRef.current.src = "";
        imgRef.current = null;
      }
    };
  }, [url, connect]);

  const disconnect = useCallback(() => {
    fIdRef.current++;
    if (imgRef.current) {
      imgRef.current.src = "";
      imgRef.current = null;
    }
  }, []);

  /** Draw MJPEG frame to a canvas context (scaled to canvas size) */
  const drawToCanvas = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number): boolean => {
      const img = imgRef.current;
      if (!img || !img.complete || !img.naturalWidth) return false;
      ctx.drawImage(img, 0, 0, w, h);
      return true;
    },
    [],
  );

  return {
    /** MJPEG frame → processing canvas (PROC_W x PROC_H) */
    drawToCanvas,
    /** Size of original MJPEG frame */
    getSize: useCallback(() => szRef.current, []),
    /** Reconnect (call when URL changes) */
    reconnect: useCallback((u: string) => { disconnect(); connect(u); }, [disconnect, connect]),
  };
}
