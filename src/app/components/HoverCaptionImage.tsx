"use client";

import { useEffect, useRef, useState } from "react";

type HoverCaptionImageProps = {
  src: string;
  alt?: string | null;
  caption?: string | null;
  className?: string;
};

export default function HoverCaptionImage({
  src,
  alt,
  caption,
  className,
}: HoverCaptionImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [rotationDeg, setRotationDeg] = useState<number | null>(null);

  // Set a stable random rotation on mount to avoid SSR hydration mismatch
  useEffect(() => {
    const deg = Math.round(Math.random() * 20 - 10); // -10 ~ 10
    setRotationDeg(deg);
  }, []);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    // Use container-relative coordinates for stability during horizontal scroll
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12 });
  }

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={onMouseMove}
      style={visible ? { position: "relative", zIndex: 100 } : undefined}
    >
      <div className="h-full w-auto">
        <img
          className="block max-h-full h-auto w-auto scale-105 transition-transform duration-100"
          src={src}
          alt={alt ?? ""}
          draggable={false}
          style={
            visible
              ? {
                  transform: `rotate(0deg) scale(1.05)`,
                  transformOrigin: "center",
                }
              : rotationDeg !== null
              ? {
                  transform: `rotate(${rotationDeg}deg) scale(1.05)`,
                  transformOrigin: "center",
                }
              : undefined
          }
        />
      </div>
      {caption && visible && pos && (
        <h1
          className="flex items-center justify-center pointer-events-none absolute z-30 w-max whitespace-pre-line rounded bg-black px-3 py-2 text-white shadow m-0 leading-none"
          style={{ left: pos.x, top: pos.y }}
          dangerouslySetInnerHTML={{ __html: caption }}
        />
      )}
    </div>
  );
}
