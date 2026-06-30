"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Ball,
  BALL_COLORS,
  BG_LERP,
  MAX_DT,
  PROC_H,
  PROC_W,
} from "@/lib/interactive-camera/types";
import { useMjpegStream } from "@/lib/interactive-camera/useMjpegStream";
import { usePhoneStream } from "@/lib/interactive-camera/usePhoneStream";

/* ---------- same processing functions as InteractiveCamera ---------- */

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function toGrayscale(img: ImageData, out: Uint8Array) {
  const d = img.data;
  for (let i = 0; i < d.length; i += 4)
    out[i / 4] = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
}

function subtractBackground(
  current: Uint8Array,
  bg: Uint8Array,
  mask: Uint8Array,
  th: number,
  len: number,
) {
  for (let i = 0; i < len; i++)
    mask[i] = Math.abs(current[i] - bg[i]) > th ? 255 : 0;
}

function updateBackground(
  bg: Uint8Array,
  cur: Uint8Array,
  mask: Uint8Array,
  rate: number,
  len: number,
) {
  for (let i = 0; i < len; i++) if (mask[i] === 0)
    bg[i] = (bg[i] * (1 - rate) + cur[i] * rate) | 0;
}

function ccLabel(mask: Uint8Array, labels: Int32Array, w: number, h: number) {
  const N = w * h;
  const idx = (x: number, y: number) => y * w + x;
  labels.fill(0);
  let next = 1;
  const equiv = new Int32Array(N);
  for (let i = 0; i < N; i++) equiv[i] = i;
  const root = (x: number): number => {
    while (equiv[x] !== x) {
      equiv[x] = equiv[equiv[x]];
      x = equiv[x];
    }
    return x;
  };
  const merge = (a: number, b: number) => {
    const ra = root(a), rb = root(b);
    if (ra < rb) equiv[rb] = ra;
    else equiv[ra] = rb;
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (mask[idx(x, y)] === 0) continue;
      const n = y > 0 && mask[idx(x, y - 1)] !== 0 ? labels[idx(x, y - 1)] : 0;
      const nw = y > 0 && x > 0 && mask[idx(x - 1, y - 1)] !== 0
        ? labels[idx(x - 1, y - 1)]
        : 0;
      const ww = x > 0 && mask[idx(x - 1, y)] !== 0
        ? labels[idx(x - 1, y)]
        : 0;
      const sw = y < h - 1 && x > 0 && mask[idx(x - 1, y + 1)] !== 0
        ? labels[idx(x - 1, y + 1)]
        : 0;
      const ns = [n, nw, ww, sw].filter((v) => v !== 0);
      if (ns.length === 0) {
        labels[idx(x, y)] = next;
        next++;
      } else {
        const min = Math.min(...ns);
        labels[idx(x, y)] = min;
        for (const l of ns) if (l !== min) merge(min, l);
      }
    }
  for (let i = 0; i < N; i++) if (labels[i] !== 0) labels[i] = root(labels[i]);
}

function findBoxes(
  labels: Int32Array,
  w: number,
  h: number,
  minArea: number,
): Rect[] {
  let max = 0;
  for (let i = 0; i < w * h; i++) if (labels[i] > max) max = labels[i];
  const L = max + 1;
  const bx = new Array(L).fill(w), bx2 = new Array(L).fill(0);
  const by = new Array(L).fill(h), by2 = new Array(L).fill(0);
  const area = new Array(L).fill(0);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const l = labels[y * w + x];
      if (l === 0) continue;
      if (x < bx[l]) bx[l] = x;
      if (x > bx2[l]) bx2[l] = x;
      if (y < by[l]) by[l] = y;
      if (y > by2[l]) by2[l] = y;
      area[l]++;
    }
  const r: Rect[] = [];
  for (let i = 1; i < L; i++)
    if (area[i] >= minArea && bx2[i] > bx[i] && by2[i] > by[i])
      r.push({
        x: bx[i],
        y: by[i],
        width: bx2[i] - bx[i] + 1,
        height: by2[i] - by[i] + 1,
      });
  return r;
}

function resolveBallRect(ball: Ball, rect: Rect, damping: number): boolean {
  const cx = Math.max(rect.x, Math.min(ball.x, rect.x + rect.width));
  const cy = Math.max(rect.y, Math.min(ball.y, rect.y + rect.height));
  const dx = ball.x - cx, dy = ball.y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist >= ball.radius) return false;
  if (dist < 0.001) {
    const tl = ball.x - rect.x, tr = rect.x + rect.width - ball.x;
    const tt = ball.y - rect.y, tb = rect.y + rect.height - ball.y;
    const md = Math.min(tl, tr, tt, tb);
    if (md === tl) {
      ball.x = rect.x - ball.radius;
      ball.vx = -Math.abs(ball.vx) * damping;
    } else if (md === tr) {
      ball.x = rect.x + rect.width + ball.radius;
      ball.vx = Math.abs(ball.vx) * damping;
    } else if (md === tt) {
      ball.y = rect.y - ball.radius;
      ball.vy = -Math.abs(ball.vy) * damping;
    } else {
      ball.y = rect.y + rect.height + ball.radius;
      ball.vy = Math.abs(ball.vy) * damping;
    }
    return true;
  }
  const nx = dx / dist, ny = dy / dist, dot = ball.vx * nx + ball.vy * ny;
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
  g: number,
  d: number,
  s: number,
) {
  for (const b of balls) {
    b.vy += g * dt;
    b.x += b.vx * s * dt;
    b.y += b.vy * s * dt;
    for (const r of rects) if (resolveBallRect(b, r, d)) break;
    if (b.x - b.radius < 0) {
      b.x = b.radius;
      b.vx = Math.abs(b.vx) * d;
    }
    if (b.x + b.radius > W) {
      b.x = W - b.radius;
      b.vx = -Math.abs(b.vx) * d;
    }
    if (b.y - b.radius < 0) {
      b.y = b.radius;
      b.vy = Math.abs(b.vy) * d;
    }
    if (b.y + b.radius > H) {
      b.y = H - b.radius;
      b.vy = -Math.abs(b.vy) * d;
    }
  }
}

/* ============================================================ */

export default function ProjectorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const procCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const backgroundRef = useRef<Uint8Array | null>(null);
  const ballsRef = useRef<Ball[]>([]);

  const [url, setUrl] = useState("");
  const [connected, setConnected] = useState(false);
  const [running, setRunning] = useState(false);
  const [showConnect, setShowConnect] = useState(true);

  const [mode, setMode] = useState<"ip" | "phone">("ip");
  const [room, setRoom] = useState<string>("");
  const [connectTab, setConnectTab] = useState<"ip" | "phone">("ip");

  const grayRef = useRef(new Uint8Array(PROC_W * PROC_H));
  const maskRef = useRef(new Uint8Array(PROC_W * PROC_H));
  const labelsRef = useRef(new Int32Array(PROC_W * PROC_H));

  const canvasW = useRef(640);
  const canvasH = useRef(480);

  // Detect phone mode from URL param ?room=XXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("room");
    if (r) {
      setMode("phone");
      setRoom(r);
      setShowConnect(false);
      setConnected(true);
    }
  }, []);

  const createBall = (id: number, W: number, H: number) => ({
    id,
    x: Math.random() * (W * 0.6) + W * 0.2,
    y: Math.random() * (H * 0.4) + H * 0.1,
    vx: (Math.random() - 0.5) * 300,
    vy: -150 - Math.random() * 100,
    radius: 20,
    color: BALL_COLORS[id % BALL_COLORS.length],
  });

  const startBalls = useCallback(() => {
    const balls: Ball[] = [];
    for (let i = 0; i < 3; i++) balls.push(createBall(i, canvasW.current, canvasH.current));
    ballsRef.current = balls;
    setRunning(true);
  }, []);

  const calibrateNow = useCallback(() => {
    const pc = procCanvasRef.current;
    if (!pc) return;
    const ctx = pc.getContext("2d")!;
    if (!ctx) return;
    const img = ctx.getImageData(0, 0, PROC_W, PROC_H);
    const gray = new Uint8Array(PROC_W * PROC_H);
    toGrayscale(img, gray);
    backgroundRef.current = gray;
  }, []);

  const { drawToCanvas, getSize } = useMjpegStream(
    connected ? url : "",
    useCallback(
      (w: number, h: number) => {
        canvasW.current = w;
        canvasH.current = h;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = w;
          canvas.height = h;
        }
        // Auto calibrate + start
        setTimeout(() => {
          calibrateNow();
          startBalls();
        }, 800);
      },
      [calibrateNow, startBalls],
    ),
  );

  // Phone stream (polling from relay)
  const { drawToCanvas: drawPhone } = usePhoneStream(
    mode === "phone" ? room : "",
    useCallback(
      (w: number, h: number) => {
        canvasW.current = w;
        canvasH.current = h;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = w;
          canvas.height = h;
        }
        setTimeout(() => {
          calibrateNow();
          startBalls();
        }, 800);
      },
      [calibrateNow, startBalls],
    ),
  );

  // Unified draw ref — loop calls this regardless of mode
  const drawRef = useRef(drawToCanvas);
  useEffect(() => { drawRef.current = mode === "phone" ? drawPhone : drawToCanvas; }, [mode, drawPhone, drawToCanvas]);

  // RAF loop
  useEffect(() => {
    if (!connected) return;
    const loop = (time: number) => {
      const canvas = canvasRef.current;
      const pc = procCanvasRef.current;
      if (!canvas || !pc) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const W = canvasW.current;
      const H = canvasH.current;
      const ctx = canvas.getContext("2d")!;
      const pctx = pc.getContext("2d")!;

      // 1. Grab frame via stream (processing resolution)
      const grabbed = drawRef.current(pctx, PROC_W, PROC_H);
      if (!grabbed) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const img = pctx.getImageData(0, 0, PROC_W, PROC_H);
      toGrayscale(img, grayRef.current);

      // 2. Background subtraction
      let rects: Rect[] = [];
      const bg = backgroundRef.current;
      if (bg) {
        subtractBackground(
          grayRef.current,
          bg,
          maskRef.current,
          30,
          PROC_W * PROC_H,
        );
        updateBackground(
          bg,
          grayRef.current,
          maskRef.current,
          BG_LERP,
          PROC_W * PROC_H,
        );
        ccLabel(maskRef.current, labelsRef.current, PROC_W, PROC_H);
        rects = findBoxes(labelsRef.current, PROC_W, PROC_H, 50);

        if (running) {
          const dt = Math.min((time - lastTimeRef.current) / 1000, MAX_DT);
          tickPhysics(ballsRef.current, rects, dt, W, H, 800, 0.7, 1);
        }
      }
      lastTimeRef.current = time;

      // 3. Render: draw frame background + balls
      ctx.clearRect(0, 0, W, H);
      drawRef.current(ctx, W, H);
      for (const b of ballsRef.current) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [connected, running]);

  // Fullscreen auto
  useEffect(() => {
    const goFull = () => {
      try {
        document.documentElement.requestFullscreen();
      } catch {}
      try {
        (screen as any).orientation?.lock?.("landscape");
      } catch {}
    };
    document.addEventListener("click", goFull, { once: true });
    document.addEventListener("touchstart", goFull, { once: true });
    if (connected) setTimeout(goFull, 1000);
    return () => {
      document.removeEventListener("click", goFull);
      document.removeEventListener("touchstart", goFull);
    };
  }, [connected]);

  // Body styles
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
    };
  }, []);

  if (showConnect) {
    const roomId = Math.random().toString(36).slice(2, 6).toUpperCase();
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const projectorUrl = `${baseUrl}/interactive-camera/projector?room=${roomId}`;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: "32px",
          fontFamily: "'Space Grotesk', sans-serif",
          background: "#121212",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "-0.05em",
            marginBottom: "8px",
          }}
        >
          Projector Mode
        </h1>

        {/* Tab selector */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "24px",
            background: "#1e1e1e",
            padding: "4px",
            border: "3px solid white",
          }}
        >
          <button
            onClick={() => setConnectTab("ip")}
            style={{
              padding: "8px 20px",
              background: connectTab === "ip" ? "#22d3ee" : "transparent",
              color: connectTab === "ip" ? "black" : "white",
              border: "none",
              fontWeight: 900,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            IP Camera
          </button>
          <button
            onClick={() => setConnectTab("phone")}
            style={{
              padding: "8px 20px",
              background: connectTab === "phone" ? "#a78bfa" : "transparent",
              color: connectTab === "phone" ? "black" : "white",
              border: "none",
              fontWeight: 900,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            📱 HP Langsung
          </button>
        </div>

        {connectTab === "ip" ? (
          <>
            <p
              style={{
                fontSize: "0.8rem",
                opacity: 0.5,
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              Masukin URL IP Camera dari HP
            </p>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setConnected(true) && setShowConnect(false)}
              placeholder="http://192.168.1.5:8080/video"
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "12px 16px",
                fontSize: "1rem",
                border: "3px solid #fff",
                background: "white",
                color: "black",
                fontWeight: "bold",
                outline: "none",
                marginBottom: "16px",
              }}
            />
            <button
              onClick={() => { setConnected(true); setShowConnect(false); }}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "14px",
                background: "#22d3ee",
                color: "black",
                border: "3px solid white",
                fontSize: "1rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              Connect
            </button>
            <p
              style={{
                fontSize: "0.7rem",
                opacity: 0.3,
                marginTop: "24px",
                textAlign: "center",
              }}
            >
              Download IP Webcam di Play Store &rarr; Start server &rarr; Masukin URL di sini
            </p>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: "0.8rem",
                opacity: 0.5,
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              1. Buka link ini di HP &rarr; izinin kamera
            </p>
            <a
              href={`/interactive-camera/send?room=${roomId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "14px",
                background: "#a78bfa",
                color: "black",
                border: "3px solid white",
                fontSize: "1rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                cursor: "pointer",
                display: "block",
                textAlign: "center",
                textDecoration: "none",
                marginBottom: "20px",
              }}
            >
              📱 Buka Sender
            </a>
            <p
              style={{
                fontSize: "0.7rem",
                opacity: 0.3,
                marginBottom: "8px",
                textAlign: "center",
              }}
            >
              Atau scan QR di HP untuk buka sender
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(baseUrl + "/interactive-camera/send?room=" + roomId)}`}
              alt="QR for sender"
              width="180"
              height="180"
              style={{
                border: "3px solid white",
                background: "white",
                padding: "4px",
              }}
            />
            <p
              style={{
                fontSize: "0.85rem",
                opacity: 0.5,
                marginTop: "20px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Room: <span style={{ color: "#a78bfa" }}>{roomId}</span>
            </p>
            <button
              onClick={() => {
                setMode("phone");
                setRoom(roomId);
                setShowConnect(false);
                setConnected(true);
              }}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "14px",
                background: "#22d3ee",
                color: "black",
                border: "3px solid white",
                fontSize: "1rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                marginTop: "16px",
              }}
            >
              Mulai (Udah Connect)
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={procCanvasRef}
        width={PROC_W}
        height={PROC_H}
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: 16,
          background: "rgba(0,0,0,0.6)",
          color: "#22d3ee",
          padding: "4px 10px",
          fontSize: "10px",
          fontFamily: "monospace",
          fontWeight: "bold",
        }}
      >
        {running ? "▶ Running" : "⏳ Calibrating..."}
        {mode === "phone" && ` | 📱 Room ${room}`}
      </div>
    </div>
  );
}
