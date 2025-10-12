"use client";

import { useEffect, useMemo, useRef, useState, useId } from "react";

const DFLIP_BASE = "/plugins/dflip";
const DFLIP_SCRIPT_SRC = `${DFLIP_BASE}/js/dflip.min.js`;
const DFLIP_STYLES = [
  { id: "dflip-style", href: `${DFLIP_BASE}/css/dflip.min.css` },
  { id: "dflip-icons", href: `${DFLIP_BASE}/css/themify-icons.min.css` },
];

const scriptPromises = new Map<string, Promise<void>>();
let jqueryReady: Promise<void> | null = null;

declare global {
  interface Window {
    jQuery?: any;
    $?: any;
    DFLIP?: { parseBooks: () => void };
    dFlipLocation?: string;
  }
}

type DFlipViewerProps = {
  pdfUrl: string;
  height?: number | string;
  className?: string;
};

function ensureStyles() {
  if (typeof document === "undefined") {
    return;
  }

  DFLIP_STYLES.forEach(({ id, href }) => {
    if (document.getElementById(id)) {
      return;
    }

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  });
}

function loadScript(id: string, src: string) {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  if (document.getElementById(id)) {
    return Promise.resolve();
  }

  const cached = scriptPromises.get(id);
  if (cached) {
    return cached;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      scriptPromises.delete(id);
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.body.appendChild(script);
  });

  scriptPromises.set(id, promise);
  return promise;
}

async function ensureJQuery() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.jQuery) {
    return;
  }

  if (!jqueryReady) {
    jqueryReady = import("jquery").then((module) => {
      const jq = module.default ?? module;
      window.jQuery = jq;
      window.$ = jq;
    });
  }

  await jqueryReady;
}

async function ensureDFlip() {
  if (typeof window === "undefined") {
    return;
  }

  await ensureJQuery();
  await loadScript("dflip-core", DFLIP_SCRIPT_SRC);

  if (!window.jQuery) {
    throw new Error("jQuery did not initialize correctly.");
  }

  if (!window.DFLIP) {
    throw new Error("dFlip did not initialize correctly.");
  }

  window.dFlipLocation = `${DFLIP_BASE}/`;
}

export function DFlipViewer({
  pdfUrl,
  height = 640,
  className,
}: DFlipViewerProps) {
  const rawId = useId();
  const bookId = useMemo(() => `dflip-${rawId.replace(/[:]/g, "-")}`, [rawId]);
  const bookRef = useRef<HTMLDivElement | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    ensureStyles();
    let cancelled = false;

    ensureDFlip()
      .then(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setInitError(error.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady || !bookRef.current || !pdfUrl) {
      return;
    }

    const element = bookRef.current;

    const dispose = () => {
      const existing = (window as Record<string, any>)[bookId];
      if (existing?.dispose) {
        try {
          existing.dispose();
        } catch {
          // ignore dispose errors, dFlip will clean up on next init
        }
      }
      delete (window as Record<string, any>)[bookId];
      element.innerHTML = "";
    };

    dispose();

    element.removeAttribute("df-parsed");
    element.removeAttribute("parsed");

    const heightValue = typeof height === "number" ? `${height}` : height ?? "";
    if (heightValue) {
      element.setAttribute("height", heightValue);
    } else {
      element.removeAttribute("height");
    }
    element.setAttribute("source", pdfUrl);

    window.DFLIP?.parseBooks();

    return () => {
      dispose();
      element.removeAttribute("source");
      element.removeAttribute("df-parsed");
      element.removeAttribute("parsed");
      element.removeAttribute("height");
    };
  }, [bookId, height, isReady, pdfUrl]);

  if (initError) {
    return (
      <div className={className}>
        <p>Flipbook 로더 오류: {initError}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {!isReady && <p>카탈로그 로딩 중...</p>}
      <div
        id={bookId}
        ref={bookRef}
        className="_df_book"
        // dFlip uses inline height; ensure min height is provided for layout stability.
        style={{
          width: "100%",
          minHeight: typeof height === "number" ? `${height}px` : height ?? 640,
        }}
      />
    </div>
  );
}
