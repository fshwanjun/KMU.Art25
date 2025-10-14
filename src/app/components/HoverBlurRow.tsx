"use client";

import HoverCaptionImage from "@/app/components/HoverCaptionImage";

type ImageItem = {
  url: string;
  alt: string | null;
  caption: string | null;
};

type HoverBlurRowProps = {
  items: ImageItem[];
  className?: string;
  heightClass?: string; // e.g., "h-[40vh]"
  gapClass?: string; // optional spacing if needed
};

export default function HoverBlurRow({
  items,
  className,
  heightClass = "h-[40vh]",
  gapClass,
}: HoverBlurRowProps) {
  return (
    <div
      className={`flex flex-row items-center ${heightClass} md:${heightClass} w-max ${
        className ?? ""
      } ${gapClass ?? ""}`}
    >
      {items.map((m, index) => {
        const key = `${m.url}-${index}`;
        return (
          <div
            key={key}
            className="relative h-full w-auto shrink-0 transition duration-200 group-hover:[&:not(:hover)]:blur-[4px] hover:z-10"
          >
            <HoverCaptionImage
              src={m.url}
              alt={m.alt}
              caption={m.caption}
              className="relative h-full w-auto shrink-0"
            />
          </div>
        );
      })}
    </div>
  );
}
