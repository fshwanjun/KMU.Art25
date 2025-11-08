"use client";

import { useLightbox } from "@/app/components/LightboxProvider";

type ImageItem = {
  url: string;
  alt: string | null;
  caption: string | null;
};

export default function ArchiveImagesClient({
  images,
}: {
  images: ImageItem[];
}) {
  const { openLightbox } = useLightbox();
  return (
    <>
      {images.map((m, index) => (
        <div className="relative w-full aspect-[16/9] mb-4" key={index}>
          <img
            className="w-full h-full object-cover cursor-zoom-in"
            src={m.url}
            alt={m.alt ?? "archive"}
            draggable={false}
            onClick={() =>
              openLightbox({ src: m.url, alt: m.alt, caption: m.caption })
            }
          />
        </div>
      ))}
    </>
  );
}


