"use client";

import { useEffect, useMemo, useRef, useState, useId } from "react";

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

type StyleAsset = { id: string; href: string };

type DFlipViewerProps = {
  pdfUrl: string;
  height?: number | string;
  className?: string;
};

function resolveDFlipBase() {
  const envBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const assetPrefix = (() => {
    if (typeof window === "undefined") {
      return envBase;
    }
    const globalWindow = window as {
      __NEXT_DATA__?: { assetPrefix?: string };
      __NEXT_ROUTER_BASEPATH?: string;
      __next_router_basePath?: string;
    };
    const nextData = globalWindow.__NEXT_DATA__;
    const prefix =
      nextData?.assetPrefix ??
      globalWindow.__NEXT_ROUTER_BASEPATH ??
      globalWindow.__next_router_basePath ??
      envBase;

    if (!prefix && typeof window !== "undefined") {
      const currentSegments = window.location.pathname
        .split("/")
        .filter(Boolean);

      const page = (window as { __NEXT_DATA__?: { page?: string } })
        .__NEXT_DATA__?.page;
      if (!page) return "";

      const pageSegments = page.split("/").filter(Boolean);
      if (currentSegments.length >= pageSegments.length) {
        const baseSegments = currentSegments.slice(
          0,
          currentSegments.length - pageSegments.length
        );
        return `/${baseSegments.join("/")}`.replace(/\/$/, "");
      }
    }

    return prefix;
  })();

  let base = assetPrefix.replace(/\/$/, "");

  if (!base && typeof window !== "undefined") {
    const chunkScript = document.querySelector<HTMLScriptElement>(
      'script[src*="/_next/"]'
    );
    const src = chunkScript?.getAttribute("src");
    if (src) {
      const url = src.startsWith("http")
        ? new URL(src)
        : new URL(src, window.location.origin);
      const pathName = url.pathname;
      const idx = pathName.indexOf("/_next/");
      if (idx > -1) {
        base = pathName.slice(0, idx).replace(/\/$/, "");
      }
    }
  }

  if (!base && typeof window !== "undefined") {
    const page = (window as { __NEXT_DATA__?: { page?: string } }).__NEXT_DATA__
      ?.page;
    if (page) {
      const normalizedPage = page.replace(/\/$/, "");
      const pathname = window.location.pathname.replace(/\/$/, "");
      if (pathname.endsWith(normalizedPage)) {
        base = pathname.slice(0, -normalizedPage.length).replace(/\/$/, "");
      }
    }
  }

  if (!base) {
    return "/plugins/dflip";
  }

  if (/^https?:\/\//i.test(base)) {
    return `${base}/plugins/dflip`;
  }

  const withLeading = base.startsWith("/") ? base : `/${base}`;
  return `${withLeading}/plugins/dflip`;
}

function joinWithBase(base: string, path: string) {
  if (!base) {
    return path;
  }

  const sanitizedPath = path.replace(/^\/+/, "");
  if (/^https?:\/\//i.test(base)) {
    return `${base.replace(/\/+$/, "")}/${sanitizedPath}`;
  }

  const baseWithLeading = base.startsWith("/") ? base : `/${base}`;
  return `${baseWithLeading.replace(/\/+$/, "")}/${sanitizedPath}`;
}

function resolvePublicUrl(base: string, target: string) {
  if (!target) {
    return "";
  }

  if (/^https?:\/\//i.test(target)) {
    return target;
  }

  if (base && target.startsWith(base)) {
    return target;
  }

  if (target.startsWith("/")) {
    return joinWithBase(base, target);
  }

  if (target.startsWith("./") || target.startsWith("../")) {
    return target;
  }

  return joinWithBase(base, `/${target}`);
}

function ensureStyles(styles: StyleAsset[]) {
  if (typeof document === "undefined") {
    return;
  }

  styles.forEach(({ id, href }) => {
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

async function ensureDFlip(basePath: string) {
  if (typeof window === "undefined") {
    return;
  }

  await ensureJQuery();
  await loadScript("dflip-core", `${basePath}/js/dflip.min.js`);

  if (!window.jQuery) {
    throw new Error("jQuery did not initialize correctly.");
  }

  if (!window.DFLIP) {
    throw new Error("dFlip did not initialize correctly.");
  }

  window.dFlipLocation = `${basePath}/`;
}

export function DFlipViewer({
  pdfUrl,
  height = 640,
  className,
}: DFlipViewerProps) {
  const dflipBase = useMemo(resolveDFlipBase, []);
  const publicBase = useMemo(
    () => dflipBase.replace(/\/plugins\/dflip$/, "") || "",
    [dflipBase]
  );
  const styleAssets = useMemo<StyleAsset[]>(
    () => [
      { id: "dflip-style", href: `${dflipBase}/css/dflip.min.css` },
      { id: "dflip-icons", href: `${dflipBase}/css/themify-icons.min.css` },
    ],
    [dflipBase]
  );
  const resolvedPdfUrl = useMemo(
    () => resolvePublicUrl(publicBase, pdfUrl),
    [pdfUrl, publicBase]
  );
  const rawId = useId();
  const bookId = useMemo(() => `dflip-${rawId.replace(/[:]/g, "-")}`, [rawId]);
  const bookRef = useRef<HTMLDivElement | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    ensureStyles(styleAssets);
    let cancelled = false;

    ensureDFlip(dflipBase)
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
  }, [dflipBase, styleAssets]);

  useEffect(() => {
    if (!isReady || !bookRef.current || !resolvedPdfUrl) {
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
    element.setAttribute("source", resolvedPdfUrl);

    window.DFLIP?.parseBooks();

    return () => {
      dispose();
      element.removeAttribute("source");
      element.removeAttribute("df-parsed");
      element.removeAttribute("parsed");
      element.removeAttribute("height");
    };
  }, [bookId, height, isReady, resolvedPdfUrl]);

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
