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
  zoneKey: "gallery" | "lobby" | "oneoneone" | null;
  zoneLabel: string | null;
  thumbnail: Thumbnail | null;
};

type WorksGridClientProps = {
  items: WorksGridItem[];
};

export default function WorksGridClient({ items }: WorksGridClientProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<
    "all" | "gallery" | "lobby" | "oneoneone"
  >("all");
  const [query, setQuery] = useState<string>("");

  const handleEnter = (index: number) => setHoveredIndex(index);
  const handleLeave = () => setHoveredIndex(null);

  const filteredItems = (
    filter === "all" ? items : items.filter((item) => item.zoneKey === filter)
  ).filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q)
    );
  });

  const zoneLabels = {
    all: "All",
    gallery: "Gallery",
    lobby: "Lobby",
    oneoneone: "111호",
  };

  return (
    <>
      <div className="fixed right-8 top-4 z-50 flex items-start gap-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="검색"
          className="border-zinc-500 border-b-1 text-black font-[600] inline-block"
        />
        <div className="flex flex-col">
          {Object.entries(zoneLabels).map(([key, label]) => {
            const isActive = filter === (key as typeof filter);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key as typeof filter)}
                className={[
                  "text-left cursor-pointer",
                  isActive ? "text-black" : "text-zinc-500",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <ul className="grid grid-cols-3 gap-20 pt-20 overflow-hidden">
        {filteredItems.map((item, index) => {
          const isBlurred = hoveredIndex !== null && hoveredIndex !== index;
          const hasThumbnail = Boolean(item.thumbnail?.url);
          const zoneClass = `zone-${String(item.zoneKey ?? "none")}`;
          return (
            <li
              key={item.id}
              className={["h-fit transition duration-200", zoneClass].join(" ")}
              data-zone={item.zoneKey ?? ""}
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
                <div className="relative flex w-full flex-col items-center justify-center">
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
                    className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] -translate-x-1/2 text-center text-black transition duration-200"
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
    </>
  );
}
