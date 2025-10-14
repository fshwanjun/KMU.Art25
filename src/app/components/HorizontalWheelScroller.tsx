"use client";

import { useEffect, useRef } from "react";

type HorizontalWheelScrollerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function HorizontalWheelScroller({
  children,
  className,
  style,
}: HorizontalWheelScrollerProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      // Only translate vertical scroll gestures to horizontal when the element is horizontally scrollable
      const node = ref.current;
      if (!node || e.deltaY === 0) return;
      const max = node.scrollWidth - node.clientWidth;
      if (max <= 0) return;
      // Prevent the page from scrolling vertically
      e.preventDefault();
      // Scroll horizontally by the vertical delta; tune factor if needed
      node.scrollLeft = Math.max(0, Math.min(max, node.scrollLeft + e.deltaY));
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
