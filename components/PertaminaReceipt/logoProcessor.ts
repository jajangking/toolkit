"use client";

export interface LogoProcessOptions {
  threshold?: number;
  dithering?: boolean;
  sharpen?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function autoCrop(
  data: Uint8ClampedArray,
  width: number,
  height: number
): { x: number; y: number; w: number; h: number } {
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 10 || (r > 240 && g > 240 && b > 240)) continue;
      found = true;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  if (!found) return { x: 0, y: 0, w: width, h: height };

  const margin = 2;
  return {
    x: Math.max(0, minX - margin),
    y: Math.max(0, minY - margin),
    w: Math.min(width - Math.max(0, minX - margin), maxX - minX + 1 + margin * 2),
    h: Math.min(height - Math.max(0, minY - margin), maxY - minY + 1 + margin * 2),
  };
}

function floydSteinberg(pixels: Uint8ClampedArray, width: number, height: number, threshold: number): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const oldVal = pixels[i];
      const newVal = oldVal <= threshold ? 0 : 255;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = newVal;
      const err = oldVal - newVal;

      if (x + 1 < width) {
        const ri = (y * width + x + 1) * 4;
        pixels[ri] = Math.min(255, Math.max(0, pixels[ri] + (err * 7) / 16));
        pixels[ri + 1] = Math.min(255, Math.max(0, pixels[ri + 1] + (err * 7) / 16));
        pixels[ri + 2] = Math.min(255, Math.max(0, pixels[ri + 2] + (err * 7) / 16));
      }
      if (y + 1 < height) {
        if (x - 1 >= 0) {
          const li = ((y + 1) * width + x - 1) * 4;
          pixels[li] = Math.min(255, Math.max(0, pixels[li] + (err * 3) / 16));
          pixels[li + 1] = Math.min(255, Math.max(0, pixels[li + 1] + (err * 3) / 16));
          pixels[li + 2] = Math.min(255, Math.max(0, pixels[li + 2] + (err * 3) / 16));
        }
        const bi = ((y + 1) * width + x) * 4;
        pixels[bi] = Math.min(255, Math.max(0, pixels[bi] + (err * 5) / 16));
        pixels[bi + 1] = Math.min(255, Math.max(0, pixels[bi + 1] + (err * 5) / 16));
        pixels[bi + 2] = Math.min(255, Math.max(0, pixels[bi + 2] + (err * 5) / 16));

        if (x + 1 < width) {
          const ri = ((y + 1) * width + x + 1) * 4;
          pixels[ri] = Math.min(255, Math.max(0, pixels[ri] + (err * 1) / 16));
          pixels[ri + 1] = Math.min(255, Math.max(0, pixels[ri + 1] + (err * 1) / 16));
          pixels[ri + 2] = Math.min(255, Math.max(0, pixels[ri + 2] + (err * 1) / 16));
        }
      }
    }
  }
}

function applySharpen(pixels: Uint8ClampedArray, width: number, height: number): void {
  const copy = new Uint8ClampedArray(pixels);
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pi = ((y + ky) * width + (x + kx)) * 4;
          const k = kernel[(ky + 1) * 3 + (kx + 1)];
          r += copy[pi] * k;
          g += copy[pi + 1] * k;
          b += copy[pi + 2] * k;
        }
      }
      pixels[i] = Math.min(255, Math.max(0, r));
      pixels[i + 1] = Math.min(255, Math.max(0, g));
      pixels[i + 2] = Math.min(255, Math.max(0, b));
    }
  }
}

export async function processLogoUrl(
  url: string,
  options: LogoProcessOptions = {}
): Promise<string> {
  const img = await loadImage(url);
  return processImage(img, options);
}

export async function processLogoFile(
  file: File,
  options: LogoProcessOptions = {}
): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    return await processLogoUrl(url, options);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function processImage(img: HTMLImageElement, options: LogoProcessOptions): string {
  const {
    threshold = 128,
    dithering = false,
    sharpen = true,
    maxWidth = 220,
    maxHeight = 80,
  } = options;

  let { width: srcW, height: srcH } = img;

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = srcW;
  cropCanvas.height = srcH;
  const cropCtx = cropCanvas.getContext("2d")!;
  cropCtx.fillStyle = "#ffffff";
  cropCtx.fillRect(0, 0, srcW, srcH);
  cropCtx.drawImage(img, 0, 0);

  const cropData = cropCtx.getImageData(0, 0, srcW, srcH);
  const crop = autoCrop(cropData.data, srcW, srcH);

  let logoW = crop.w;
  let logoH = crop.h;

  const scale = Math.min(maxWidth / logoW, maxHeight / logoH, 1);
  const finalW = Math.round(logoW * scale);
  const finalH = Math.round(logoH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = finalW;
  canvas.height = finalH;
  const ctx = canvas.getContext("2d")!;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    cropCanvas,
    crop.x, crop.y, crop.w, crop.h,
    0, 0, finalW, finalH
  );

  const imageData = ctx.getImageData(0, 0, finalW, finalH);
  const pixels = imageData.data;

  ctx.imageSmoothingEnabled = true;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a < 128 || (r > 240 && g > 240 && b > 240)) {
      pixels[i] = 255;
      pixels[i + 1] = 255;
      pixels[i + 2] = 255;
      pixels[i + 3] = 255;
      continue;
    }

    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    pixels[i] = gray;
    pixels[i + 1] = gray;
    pixels[i + 2] = gray;
    pixels[i + 3] = 255;
  }

  if (sharpen) {
    applySharpen(pixels, finalW, finalH);
  }

  if (dithering) {
    for (let i = 0; i < pixels.length; i += 4) {
      const gray = pixels[i];
      pixels[i] = gray;
      pixels[i + 1] = gray;
      pixels[i + 2] = gray;
    }
    floydSteinberg(pixels, finalW, finalH, threshold);
  } else {
    for (let i = 0; i < pixels.length; i += 4) {
      const val = pixels[i] <= threshold ? 0 : 255;
      pixels[i] = val;
      pixels[i + 1] = val;
      pixels[i + 2] = val;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}
