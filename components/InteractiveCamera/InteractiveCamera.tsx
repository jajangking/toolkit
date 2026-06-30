"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Ball,
  BALL_COLORS,
  BG_LERP,
  MAX_DT,
  Point,
  PROC_H,
  PROC_W,
  ProcessingConfig,
} from "@/lib/interactive-camera/types";
import { useMjpegStream } from "@/lib/interactive-camera/useMjpegStream";
import ControlPanel from "./ControlPanel";

/* ============================================================
   PURE PROCESSING FUNCTIONS (module-level, no React)
   ============================================================ */

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Convert RGBA ImageData → grayscale Uint8Array */
function toGrayscale(img: ImageData, out: Uint8Array) {
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    out[i / 4] = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
  }
}

/** Absolute difference threshold → binary mask */
function subtractBackground(
  current: Uint8Array,
  background: Uint8Array,
  mask: Uint8Array,
  threshold: number,
  len: number,
) {
  for (let i = 0; i < len; i++) {
    mask[i] = Math.abs(current[i] - background[i]) > threshold ? 255 : 0;
  }
}

/** Running average — only blend non-object pixels */
function updateBackground(
  bg: Uint8Array,
  cur: Uint8Array,
  mask: Uint8Array,
  rate: number,
  len: number,
) {
  for (let i = 0; i < len; i++) {
    if (mask[i] === 0) {
      bg[i] = (bg[i] * (1 - rate) + cur[i] * rate) | 0;
    }
  }
}

/* ---------- Connected-component labeling (two-pass) ---------- */

function unionFindRoot(equiv: Int32Array, x: number): number {
  while (equiv[x] !== x) {
    equiv[x] = equiv[equiv[x]];
    x = equiv[x];
  }
  return x;
}

function unionFindMerge(equiv: Int32Array, a: number, b: number) {
  const ra = unionFindRoot(equiv, a);
  const rb = unionFindRoot(equiv, b);
  if (ra < rb) equiv[rb] = ra;
  else equiv[ra] = rb;
}

function connectedComponents(
  mask: Uint8Array,
  labels: Int32Array,
  w: number,
  h: number,
): number {
  const N = w * h;
  labels.fill(0);
  let nextLabel = 1;
  const equiv = new Int32Array(N);
  for (let i = 0; i < N; i++) equiv[i] = i;

  const idx = (x: number, y: number) => y * w + x;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[idx(x, y)] === 0) continue;
      const n = y > 0 && mask[idx(x, y - 1)] !== 0
        ? labels[idx(x, y - 1)]
        : 0;
      const nw = y > 0 && x > 0 && mask[idx(x - 1, y - 1)] !== 0
        ? labels[idx(x - 1, y - 1)]
        : 0;
      const ww = x > 0 && mask[idx(x - 1, y)] !== 0
        ? labels[idx(x - 1, y)]
        : 0;
      const sw = y < h - 1 && x > 0 && mask[idx(x - 1, y + 1)] !== 0
        ? labels[idx(x - 1, y + 1)]
        : 0;

      const neighbors = [n, nw, ww, sw].filter((v) => v !== 0);
      if (neighbors.length === 0) {
        labels[idx(x, y)] = nextLabel;
        nextLabel++;
      } else {
        const minLabel = Math.min(...neighbors);
        labels[idx(x, y)] = minLabel;
        for (const lbl of neighbors) {
          if (lbl !== minLabel) unionFindMerge(equiv, minLabel, lbl);
        }
      }
    }
  }

  // Second pass — merge labels
  for (let i = 0; i < N; i++) {
    if (labels[i] !== 0) labels[i] = unionFindRoot(equiv, labels[i]);
  }
  return nextLabel;
}

/** Extract bounding boxes from labeled image, filter by min area */
function findBoundingBoxes(
  labels: Int32Array,
  w: number,
  h: number,
  maxLabel: number,
  minArea: number,
): Rect[] {
  // Determine actual max label (compressed after union-find)
  let actualMax = 0;
  for (let i = 0; i < w * h; i++) {
    if (labels[i] > actualMax) actualMax = labels[i];
  }
  const L = actualMax + 1;

  const boxes: number[] = new Array(L * 4).fill(0);
  const areas: number[] = new Array(L).fill(0);

  // init boxes
  for (let i = 0; i < L; i++) {
    boxes[i * 4] = w; // minX
    boxes[i * 4 + 1] = 0; // maxX
    boxes[i * 4 + 2] = h; // minY
    boxes[i * 4 + 3] = 0; // maxY
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const l = labels[y * w + x];
      if (l === 0) continue;
      const off = l * 4;
      if (x < boxes[off]) boxes[off] = x;
      if (x > boxes[off + 1]) boxes[off + 1] = x;
      if (y < boxes[off + 2]) boxes[off + 2] = y;
      if (y > boxes[off + 3]) boxes[off + 3] = y;
      areas[l]++;
    }
  }

  const result: Rect[] = [];
  for (let i = 1; i < L; i++) {
    if (areas[i] < minArea) continue;
    const off = i * 4;
    const x = boxes[off];
    const maxX = boxes[off + 1];
    const y = boxes[off + 2];
    const maxY = boxes[off + 3];
    if (maxX > x && maxY > y) {
      result.push({ x, y, width: maxX - x + 1, height: maxY - y + 1 });
    }
  }
  return result;
}

/* ---------- Physics ---------- */

function circleRectCollision(
  bx: number,
  by: number,
  r: number,
  rect: Rect,
): boolean {
  const cx = Math.max(rect.x, Math.min(bx, rect.x + rect.width));
  const cy = Math.max(rect.y, Math.min(by, rect.y + rect.height));
  const dx = bx - cx;
  const dy = by - cy;
  return dx * dx + dy * dy < r * r;
}

function resolveBallRect(
  ball: Ball,
  rect: Rect,
  damping: number,
): boolean {
  const cx = Math.max(rect.x, Math.min(ball.x, rect.x + rect.width));
  const cy = Math.max(rect.y, Math.min(ball.y, rect.y + rect.height));
  const dx = ball.x - cx;
  const dy = ball.y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist >= ball.radius) return false;
  if (dist < 0.001) {
    // Ball center inside rect — push to nearest edge
    const toLeft = ball.x - rect.x;
    const toRight = rect.x + rect.width - ball.x;
    const toTop = ball.y - rect.y;
    const toBottom = rect.y + rect.height - ball.y;
    const minD = Math.min(toLeft, toRight, toTop, toBottom);
    if (minD === toLeft) {
      ball.x = rect.x - ball.radius;
      ball.vx = -Math.abs(ball.vx) * damping;
    } else if (minD === toRight) {
      ball.x = rect.x + rect.width + ball.radius;
      ball.vx = Math.abs(ball.vx) * damping;
    } else if (minD === toTop) {
      ball.y = rect.y - ball.radius;
      ball.vy = -Math.abs(ball.vy) * damping;
    } else {
      ball.y = rect.y + rect.height + ball.radius;
      ball.vy = Math.abs(ball.vy) * damping;
    }
    return true;
  }

  const nx = dx / dist;
  const ny = dy / dist;
  const dot = ball.vx * nx + ball.vy * ny;
  if (dot >= 0) return false;

  ball.vx -= (1 + damping) * dot * nx;
  ball.vy -= (1 + damping) * dot * ny;
  const overlap = ball.radius - dist;
  ball.x += nx * (overlap + 0.5);
  ball.y += ny * (overlap + 0.5);
  return true;
}

function tickPhysics(
  balls: Ball[],
  rects: Rect[],
  dt: number,
  W: number,
  H: number,
  gravity: number,
  damping: number,
  speedMul: number,
) {
  for (const b of balls) {
    b.vy += gravity * dt;
    const nx = b.x + b.vx * speedMul * dt;
    const ny = b.y + b.vy * speedMul * dt;
    b.x = nx;
    b.y = ny;

    // Collision with rects
    for (const r of rects) {
      if (resolveBallRect(b, r, damping)) break;
    }

    // Bounds bounce
    if (b.x - b.radius < 0) {
      b.x = b.radius;
      b.vx = Math.abs(b.vx) * damping;
    }
    if (b.x + b.radius > W) {
      b.x = W - b.radius;
      b.vx = -Math.abs(b.vx) * damping;
    }
    if (b.y - b.radius < 0) {
      b.y = b.radius;
      b.vy = Math.abs(b.vy) * damping;
    }
    if (b.y + b.radius > H) {
      b.y = H - b.radius;
      b.vy = -Math.abs(b.vy) * damping;
    }
  }
}

/* ---------- Rendering ---------- */

function renderFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement | null,
  W: number,
  H: number,
  rects: Rect[],
  balls: Ball[],
  showDebug: boolean,
  drawMjpeg?: (ctx: CanvasRenderingContext2D, w: number, h: number) => boolean,
) {
  ctx.clearRect(0, 0, W, H);

  // Live video background (webcam via video element, IP via MJPEG draw)
  const isIp = !video && !!drawMjpeg;
  if (isIp) {
    drawMjpeg!(ctx, W, H);
  } else if (video) {
    ctx.drawImage(video, 0, 0, W, H);
  }

  // Debug overlay — bounding boxes
  if (showDebug) {
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 3;
    for (const r of rects) {
      // Scale from 320x240 → canvas size
      const sx = (s: number) => (s / PROC_W) * W;
      const sy = (s: number) => (s / PROC_H) * H;
      ctx.strokeRect(sx(r.x), sy(r.y), sx(r.width), sy(r.height));
    }

    // Label
    ctx.fillStyle = "#22d3ee";
    ctx.font = `bold ${Math.round(W * 0.025)}px "Space Grotesk", sans-serif`;
    ctx.fillText(`Objects: ${rects.length}`, 10, 24);
  }

  // Balls
  for (const b of balls) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function InteractiveCamera() {
  // ----- refs -----
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const procCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const backgroundRef = useRef<Uint8Array | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const rectsRef = useRef<Rect[]>([]);

  // Reusable buffers
  const grayRef = useRef(new Uint8Array(PROC_W * PROC_H));
  const maskRef = useRef(new Uint8Array(PROC_W * PROC_H));
  const labelsRef = useRef(new Int32Array(PROC_W * PROC_H));

  // ----- state -----
  const [status, setStatus] = useState<
    "idle" | "calibrated" | "running"
  >("idle");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraSource, setCameraSource] = useState<"webcam" | "ip">("webcam");
  const [ipUrl, setIpUrl] = useState("");
  const [connectedIpUrl, setConnectedIpUrl] = useState(""); // committed on Connect click
  const [debug, setDebug] = useState(false);
  const [ballCount, setBallCount] = useState(1);
  const [speed, setSpeed] = useState(1.0);
  const [threshold, setThreshold] = useState(30);
  const [canvasSize, setCanvasSize] = useState({ w: 640, h: 480 });

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      videoRef.current!.onloadedmetadata = () => {
        videoRef.current!.play();
        const vw = videoRef.current!.videoWidth || 640;
        const vh = videoRef.current!.videoHeight || 480;
        setCanvasSize({ w: vw, h: vh });
        setCameraReady(true);
      };
    } catch (err: any) {
      setCameraError(err?.message || String(err));
    }
  }, []);

  // MJPEG stream for IP camera mode
  const { drawToCanvas: drawMjpegFrame } = useMjpegStream(
    cameraSource === "ip" ? connectedIpUrl : "",
    useCallback((w: number, h: number) => {
      setCanvasSize({ w, h });
      setCameraReady(true);
    }, []),
  );

  // Refs for values read inside RAF (stable refs, no re-render)
  const debugRef = useRef(debug);
  const thresholdRef = useRef(threshold);
  const speedRef = useRef(speed);
  const statusRef = useRef(status);
  const cameraSourceRef = useRef(cameraSource);
  const drawMjpegRef = useRef(drawMjpegFrame);
  useEffect(() => { debugRef.current = debug; }, [debug]);
  useEffect(() => { thresholdRef.current = threshold; }, [threshold]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { cameraSourceRef.current = cameraSource; }, [cameraSource]);
  useEffect(() => { drawMjpegRef.current = drawMjpegFrame; }, [drawMjpegFrame]);

  useEffect(() => {
    setCameraError(null);
    setCameraReady(false);
    setStatus("idle");
    backgroundRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = "";
    }
    if (cameraSource === "webcam") {
      startWebcam();
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = "";
      }
    };
  }, [cameraSource, startWebcam]);

  // Resize canvas when container resizes
  useEffect(() => {
    if (!cameraReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const maxW = rect.width;
      const maxH = rect.height || maxW * 0.75;
      const ratio = canvasSize.w / canvasSize.h;
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [cameraReady, canvasSize]);

  // ----- processing loop (RAF) -----
  const loop = useCallback((time: number) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const procCanvas = procCanvasRef.current;
    const isIp = cameraSourceRef.current === "ip";
    if ((!isIp && !video) || !canvas || !procCanvas) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext("2d")!;
    const procCtx = procCanvas.getContext("2d")!;

    // 1. Grab frame (webcam via video, IP via MJPEG)
    let frameGrabbed = false;
    if (isIp) {
      frameGrabbed = drawMjpegRef.current(procCtx, PROC_W, PROC_H);
    } else if (video) {
      procCtx.drawImage(video, 0, 0, PROC_W, PROC_H);
      frameGrabbed = true;
    }
    if (!frameGrabbed) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    const imageData = procCtx.getImageData(0, 0, PROC_W, PROC_H);
    toGrayscale(imageData, grayRef.current);

    // 2. Background subtraction
    let rects: Rect[] = [];
    const bg = backgroundRef.current;
    if (bg) {
      const mask = maskRef.current;
      subtractBackground(
        grayRef.current,
        bg,
        mask,
        thresholdRef.current,
        PROC_W * PROC_H,
      );

      // Update running background (adaptive lighting)
      updateBackground(bg, grayRef.current, mask, BG_LERP, PROC_W * PROC_H);

      // Find connected components
      const labels = labelsRef.current;
      const maxLabel = connectedComponents(mask, labels, PROC_W, PROC_H);
      rects = findBoundingBoxes(labels, PROC_W, PROC_H, maxLabel, 50);
      rectsRef.current = rects;

      // 3. Physics tick
      if (statusRef.current === "running") {
        const dt = Math.min((time - lastTimeRef.current) / 1000, MAX_DT);
        const speedMul = speedRef.current;
        tickPhysics(
          ballsRef.current,
          rects,
          dt,
          W,
          H,
          800,
          0.7,
          speedMul,
        );
      }
    }
    lastTimeRef.current = time;

    // 4. Render
    renderFrame(
      ctx,
      video,
      W,
      H,
      rects,
      ballsRef.current,
      debugRef.current,
      drawMjpegRef.current,
    );

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // Start / stop RAF loop based on camera readiness
  useEffect(() => {
    if (cameraReady) {
      lastTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [cameraReady, loop]);

  // ----- actions -----

  const calibrate = useCallback(() => {
    const pc = procCanvasRef.current;
    const video = videoRef.current;
    if (!pc || !video) return;
    const ctx = pc.getContext("2d")!;
    ctx.drawImage(video, 0, 0, PROC_W, PROC_H);
    const img = ctx.getImageData(0, 0, PROC_W, PROC_H);
    const gray = new Uint8Array(PROC_W * PROC_H);
    toGrayscale(img, gray);
    // Re-allocate so background ref is fresh
    backgroundRef.current = gray;
    setStatus("calibrated");
  }, []);

  const createBall = useCallback(
    (id: number, W: number, H: number): Ball => ({
      id,
      x: Math.random() * (W * 0.6) + W * 0.2,
      y: Math.random() * (H * 0.4) + H * 0.1,
      vx: (Math.random() - 0.5) * 300,
      vy: -150 - Math.random() * 100,
      radius: 16,
      color: BALL_COLORS[id % BALL_COLORS.length],
    }),
    [],
  );

  const toggleRunning = useCallback(() => {
    if (status === "running") {
      setStatus("calibrated");
    } else {
      const canvas = canvasRef.current;
      const w = canvas?.width || 640;
      const h = canvas?.height || 480;
      const balls: Ball[] = [];
      for (let i = 0; i < ballCount; i++) {
        balls.push(createBall(i, w, h));
      }
      ballsRef.current = balls;
      setStatus("running");
    }
  }, [status, ballCount, createBall]);

  const connectIpCamera = useCallback(() => {
    setCameraError(null);
    setCameraReady(false);
    setStatus("idle");
    backgroundRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = "";
    }
    setCameraSource("ip");
    setConnectedIpUrl(ipUrl.trim());
  }, [ipUrl]);

  const resetBalls = useCallback(() => {
    const canvas = canvasRef.current;
    const w = canvas?.width || 640;
    const h = canvas?.height || 480;
    const balls: Ball[] = [];
    for (let i = 0; i < ballCount; i++) {
      balls.push(createBall(i, w, h));
    }
    ballsRef.current = balls;
  }, [ballCount, createBall]);

  const toggleFullscreen = useCallback(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

  // ----- render -----
  const isRunning = status === "running";
  const isCalibrated = status === "calibrated" || status === "running";

  return (
    <div className="space-y-6">
      {/* Error state */}
      {cameraError && (
        <div className="liquid-glass neo-border neo-shadow p-8 text-center bg-rose-500/10">
          <p className="text-lg font-black uppercase tracking-tight text-rose-500 mb-4">
            🎥 Camera Error
          </p>
          <p className="font-medium text-sm mb-4">{cameraError}</p>
          <p className="text-xs font-bold text-gray-500">
            Pastikan izin kamera diaktifkan atau coba browser lain.
          </p>
        </div>
      )}

      {/* Video (hidden) */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden"
      />

      {/* Processing canvas (hidden) */}
      <canvas
        ref={procCanvasRef}
        width={PROC_W}
        height={PROC_H}
        className="hidden"
      />

      {/* Main canvas */}
      <div
        ref={canvasContainerRef}
        className="liquid-glass neo-border neo-shadow overflow-hidden bg-black relative group"
        style={{ maxWidth: "100%" }}
      >
        <canvas
          ref={canvasRef}
          className="block mx-auto"
          style={{ maxWidth: "100%", height: "auto" }}
        />
        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-2 right-2 bg-black/70 neo-border text-white px-2 py-1 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black cursor-pointer"
        >
          ⛶ Fullscreen
        </button>
      </div>

      {/* Camera not ready — loading */}
      {!cameraReady && !cameraError && (
        <div className="liquid-glass neo-border neo-shadow p-12 text-center border-dashed border-4 border-black/10 dark:border-white/10">
          <p className="text-xl font-black uppercase tracking-tighter dark:text-white/30 text-black/30 italic animate-pulse">
            Menyalakan kamera...
          </p>
        </div>
      )}

      {/* Controls */}
      {cameraReady && (
        <ControlPanel
          status={status}
          isRunning={isRunning}
          isCalibrated={isCalibrated}
          cameraSource={cameraSource}
          ipUrl={ipUrl}
          debug={debug}
          ballCount={ballCount}
          speed={speed}
          threshold={threshold}
          onCalibrate={calibrate}
          onToggleRunning={toggleRunning}
          onReset={resetBalls}
          onCameraSourceChange={setCameraSource}
          onIpUrlChange={setIpUrl}
          onConnectIp={connectIpCamera}
          onDebugChange={setDebug}
          onBallCountChange={setBallCount}
          onSpeedChange={setSpeed}
          onThresholdChange={setThreshold}
        />
      )}
    </div>
  );
}
