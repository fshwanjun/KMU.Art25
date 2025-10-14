"use client";

import Link from "next/link";
import { useState } from "react";

type Thumbnail = {
  url: string;
  alt: string | null;
};

type WorksGridItem = {
  id: number;
  slug: string;
  title: string;
  name: string;
  thumbnail: Thumbnail | null;
};

type WorksGridClientProps = {
  items: WorksGridItem[];
};

export default function WorksGridClient({ items }: WorksGridClientProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleEnter = (index: number) => setHoveredIndex(index);
  const handleLeave = () => setHoveredIndex(null);

  return (
    <ul className="grid grid-cols-3 gap-20 mb-40 ">
      {items.map((item, index) => {
        const isBlurred = hoveredIndex !== null && hoveredIndex !== index;
        const hasThumbnail = Boolean(item.thumbnail?.url);
        return (
          <li
            key={item.id}
            className="h-fit transition duration-200"
            style={{ filter: isBlurred ? "blur(4px)" : "none" }}
            onMouseEnter={() => handleEnter(index)}
            onMouseLeave={handleLeave}
          >
            <Link
              href={`/works/${encodeURIComponent(item.slug)}`}
              className="group flex h-full w-full flex-col items-center justify-start gap-4"
              onFocus={() => handleEnter(index)}
              onBlur={handleLeave}
            >
              <div className="relative flex flex-col items-center justify-center w-full">
                {hasThumbnail ? (
                  <img
                    src={item.thumbnail?.url ?? ""}
                    alt={item.thumbnail?.alt ?? ""}
                    className="mx-auto h-auto w-full max-w-[360px] object-contain"
                  />
                ) : (
                  <div className="flex aspect-[3/4] w-full max-w-[360px] items-center justify-center border border-dashed border-gray-400 text-gray-500">
                    이미지가 없습니다
                  </div>
                )}
                <div
                  className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 text-center transition duration-200"
                  style={{ opacity: hoveredIndex === index ? 1 : 0 }}
                >
                  <h1>{item.title}</h1>
                  <p>{item.name}</p>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
