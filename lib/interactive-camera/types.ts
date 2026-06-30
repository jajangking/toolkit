export interface Point {
  x: number;
  y: number;
}

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export interface ProcessingConfig {
  processWidth: number;
  processHeight: number;
  threshold: number;
  contourMinArea: number;
  rdpEpsilon: number;
  gravity: number;
  damping: number;
  speedMultiplier: number;
}

export const PROC_W = 320;
export const PROC_H = 240;
export const BG_LERP = 0.005;
export const MAX_DT = 0.05;

export const BALL_COLORS = [
  '#facc15', // yellow-400
  '#22d3ee', // cyan-400
  '#a78bfa', // violet-400
  '#34d399', // emerald-400
  '#fb923c', // orange-400
];
