'use client';

import { useLightbox } from '@/app/components/LightboxProvider';
import { cleanCaption } from '@/lib/util';

type ImageItem = {
  url: string;
  alt: string | null;
  caption: string | null;
};

export default function WorkImagesClient({ images }: { images: ImageItem[] }) {
  const { openLightbox } = useLightbox();
  return (
    <>
      {images.map((m, index) => {
        const cleanedCaption = cleanCaption(m.caption);
        return (
          <div key={index} className="relative w-full flex flex-col items-center justify-center gap-2">
            <img
              src={m.url}
              alt={m.alt ?? 'work'}
              className="w-auto h-auto max-h-[80vh] object-contain cursor-zoom-in"
              draggable={false}
              onClick={() => openLightbox({ src: m.url, alt: m.alt, caption: cleanedCaption })}
            />
            {cleanedCaption && (
              <span className="text-center text-[14px] font-normal text-gray-500">
                {cleanedCaption}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
}
