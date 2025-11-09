"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  className?: string;
  tileScale?: number;
  gapX?: number;
  gapY?: number;
  offsetX?: number;
  offsetY?: number;
  noiseScale?: number;
  noiseSpeed?: number;
  blurRadius?: number;
  blurMaskStrength?: number; // 0~1 blend amount for blurred portion
  noiseContrast?: number; // 0 = flat gray, 1 = original, >1 = stronger contrast
};

export default function NoisyBlurText({
  src,
  className,
  tileScale = 0.9,
  gapX = 160,
  gapY = 180,
  offsetX = 250,
  offsetY = 180,
  noiseScale = 0.003,
  noiseSpeed = 0.15,
  blurRadius = 4,
  blurMaskStrength = 10,
  noiseContrast = 2,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sharpCanvas = document.createElement("canvas");
    const sharpCtx = sharpCanvas.getContext("2d");
    const blurCanvas = document.createElement("canvas");
    const blurCtx = blurCanvas.getContext("2d");
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");
    if (!sharpCtx || !blurCtx || !maskCtx) return;

    let currentDpr = 1;
    let noiseBuffer: ImageData | null = null;
    let maskBuffer: ImageData | null = null;
    let imageLoaded = false;

    const ensureCanvasSize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        noiseBuffer = null;
        maskBuffer = null;
      }
      if (sharpCanvas.width !== width || sharpCanvas.height !== height) {
        sharpCanvas.width = width;
        sharpCanvas.height = height;
      }
      if (blurCanvas.width !== width || blurCanvas.height !== height) {
        blurCanvas.width = width;
        blurCanvas.height = height;
      }
      if (maskCanvas.width !== width || maskCanvas.height !== height) {
        maskCanvas.width = width;
        maskCanvas.height = height;
      }
      currentDpr = dpr;
    };

    const buildPermutation = () => {
      const base = new Uint8Array(256);
      for (let i = 0; i < 256; i += 1) base[i] = i;
      for (let i = 255; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = base[i];
        base[i] = base[j];
        base[j] = tmp;
      }
      const perm = new Uint8Array(512);
      for (let i = 0; i < 512; i += 1) perm[i] = base[i & 255];
      return perm;
    };

    const perm = buildPermutation();
    const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (t: number, a: number, b: number) => a + t * (b - a);
    const grad = (hash: number, x: number, y: number) => {
      const h = hash & 3;
      const u = h < 2 ? x : y;
      const v = h < 2 ? y : x;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };
    const perlin2d = (x: number, y: number) => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = fade(xf);
      const v = fade(yf);
      const aa = perm[X + perm[Y]];
      const ab = perm[X + perm[Y + 1]];
      const ba = perm[X + 1 + perm[Y]];
      const bb = perm[X + 1 + perm[Y + 1]];
      const x1 = lerp(u, grad(aa, xf, yf), grad(ba, xf - 1, yf));
      const x2 = lerp(u, grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1));
      return (lerp(v, x1, x2) + 1) * 0.5;
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageLoaded = true;
    };

    const drawTiles = (
      targetCtx: CanvasRenderingContext2D,
      options?: { blur?: boolean }
    ) => {
      if (!imageLoaded) return;
      targetCtx.clearRect(0, 0, canvas.width, canvas.height);
      if (options?.blur) {
        targetCtx.filter = `blur(${Math.max(0, blurRadius)}px)`;
      } else {
        targetCtx.filter = "none";
      }
      const clampedScale = Math.max(0.05, Math.min(1, tileScale));
      const tileWidth = Math.max(
        1,
        Math.floor(img.naturalWidth * clampedScale * currentDpr)
      );
      const tileHeight = Math.max(
        1,
        Math.floor(img.naturalHeight * clampedScale * currentDpr)
      );
      const stepX = tileWidth + Math.max(0, gapX) * currentDpr;
      const stepY = tileHeight + Math.max(0, gapY) * currentDpr;
      const startX =
        ((((offsetX * currentDpr) % stepX) + stepX) % stepX) - stepX;
      const startY =
        ((((offsetY * currentDpr) % stepY) + stepY) % stepY) - stepY;

      for (let y = startY; y < canvas.height + tileHeight; y += stepY) {
        for (let x = startX; x < canvas.width + tileWidth; x += stepX) {
          targetCtx.drawImage(img, x, y, tileWidth, tileHeight);
        }
      }

      targetCtx.filter = "none";
    };

    const drawFrame = () => {
      ensureCanvasSize();
      const width = canvas.width;
      const height = canvas.height;

      if (
        !noiseBuffer ||
        noiseBuffer.width !== width ||
        noiseBuffer.height !== height
      ) {
        noiseBuffer = ctx.createImageData(width, height);
      }
      if (
        !maskBuffer ||
        maskBuffer.width !== width ||
        maskBuffer.height !== height
      ) {
        maskBuffer = ctx.createImageData(width, height);
      }

      const noiseData = noiseBuffer.data;
      const maskData = maskBuffer.data;
      const ns = Math.max(0.0005, noiseScale);
      const speed = Math.max(0, noiseSpeed);
      const time = performance.now() * 0.001 * speed;
      const maskStrength = Math.min(Math.max(blurMaskStrength, 0), 1);

      for (let y = 0; y < height; y += 1) {
        const row = y * width;
        for (let x = 0; x < width; x += 1) {
          const n = perlin2d(x * ns + time, y * ns + time * 0.7);
          const contrast = Math.max(0, noiseContrast);
          const contrasted = Math.min(
            Math.max((n - 0.5) * contrast + 0.5, 0),
            1
          );
          const val = Math.floor(contrasted * 255);
          const idx = (row + x) * 4;
          noiseData[idx] = val;
          noiseData[idx + 1] = val;
          noiseData[idx + 2] = val;
          noiseData[idx + 3] = 255;

          const alpha = ((255 - val) / 255) * maskStrength;
          maskData[idx] = 255;
          maskData[idx + 1] = 255;
          maskData[idx + 2] = 255;
          maskData[idx + 3] = Math.floor(alpha * 255);
        }
      }

      if (!imageLoaded) {
        rafRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      drawTiles(sharpCtx);
      drawTiles(blurCtx, { blur: true });

      maskCtx.putImageData(maskBuffer, 0, 0);

      blurCtx.save();
      blurCtx.globalCompositeOperation = "destination-in";
      blurCtx.drawImage(maskCanvas, 0, 0);
      blurCtx.restore();

      sharpCtx.save();
      sharpCtx.globalCompositeOperation = "destination-out";
      sharpCtx.drawImage(maskCanvas, 0, 0);
      sharpCtx.restore();

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(sharpCanvas, 0, 0);
      ctx.drawImage(blurCanvas, 0, 0);

      rafRef.current = requestAnimationFrame(drawFrame);
    };

    const ro = new ResizeObserver(() => {
      ensureCanvasSize();
      noiseBuffer = null;
      maskBuffer = null;
    });
    ro.observe(canvas);
    img.src = src;
    ensureCanvasSize();
    rafRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      ro.disconnect();
    };
  }, [
    src,
    tileScale,
    gapX,
    gapY,
    offsetX,
    offsetY,
    noiseScale,
    noiseSpeed,
    blurRadius,
    blurMaskStrength,
    noiseContrast,
  ]);

  return (
    <div
      className={className ?? ""}
      style={{ width: "100vw", height: "100vh" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100vw",
          height: "100vh",
          display: "block",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}
