"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import type { NoisyBlurTextProps } from "./NoisyBlurText";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

const NoisyBlurText = dynamic<NoisyBlurTextProps>(
  () => import("./NoisyBlurText"),
  { ssr: false }
);

export default function DesktopOnlyNoisyBlurText(props: NoisyBlurTextProps) {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const update = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(event.matches);
    };

    update(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  if (!isDesktop) return null;

  return <NoisyBlurText {...props} />;
}

