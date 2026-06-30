"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Hook: Poll frame from relay API (phone mode).
 * Returns drawToCanvas with same interface as useMjpegStream.
 */
export function usePhoneStream(
  room: string,
  onFirstFrame?: (w: number, h: number) => void,
) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const szRef = useRef({ w: 640, h: 480 });
  const cbRef = useRef(onFirstFrame);
  const pollTimer = useRef(0);
  const startedRef = useRef(false);
  cbRef.current = onFirstFrame;

  useEffect(() => {
    if (!room.trim()) return;
    startedRef.current = true;

    const img = new Image();
    img.crossOrigin = "anonymous";
    imgRef.current = img;

    let first = true;

    const poll = async () => {
      if (!startedRef.current) return;
      try {
        const res = await fetch(`/api/camera-relay?room=${room}`);
        const data = await res.json();
        if (data.frame) {
          img.src = `data:image/jpeg;base64,${data.frame}`;
          img.onload = () => {
            if (first) {
              first = false;
              szRef.current = { w: img.naturalWidth || 320, h: img.naturalHeight || 240 };
              cbRef.current?.(szRef.current.w, szRef.current.h);
            }
          };
        }
      } catch { /* ignore */ }
    };

    // Poll aggressively — ~33ms (30fps)
    const loop = () => {
      poll();
      pollTimer.current = window.setTimeout(loop, 33);
    };
    loop();

    return () => {
      startedRef.current = false;
      clearTimeout(pollTimer.current);
      imgRef.current = null;
    };
  }, [room]);

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
    drawToCanvas,
    getSize: useCallback(() => szRef.current, []),
  };
}
