"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type LightboxImage = {
  src: string;
  alt?: string | null;
  caption?: string | null;
};

type LightboxContextValue = {
  openLightbox: (img: LightboxImage) => void;
  closeLightbox: () => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error("useLightbox must be used within LightboxProvider");
  }
  return ctx;
}

export default function LightboxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [current, setCurrent] = useState<LightboxImage | null>(null);

  const openLightbox = useCallback((img: LightboxImage) => {
    setCurrent(img);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setCurrent(null);
    document.body.style.overflow = "";
  }, []);

  const value = useMemo(
    () => ({ openLightbox, closeLightbox }),
    [openLightbox, closeLightbox]
  );

  return (
    <LightboxContext.Provider value={value}>
      {children}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
          onClick={closeLightbox}
        >
          <div
            className="relative p-0 m-0"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={current.src}
              alt={current.alt ?? ""}
              className="block max-w-[90vw] max-h-[90vh] object-contain cursor-zoom-out"
              draggable={false}
            />
            {current.caption && (
              <div className="px-3 py-1 text-center text-white text-sm">
                <p dangerouslySetInnerHTML={{ __html: current.caption }} />
              </div>
            )}
            <button
              type="button"
              aria-label="Close"
              className="absolute top-3 right-3 text-white text-xl"
              onClick={closeLightbox}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  );
}
