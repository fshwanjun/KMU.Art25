"use client";

import Link from "next/link";
import { useState } from "react";

type ContactWork = {
  id: number;
  slug: string;
  name: string;
  nameEn: string;
  oneWord: string;
  instagram: string;
  email: string;
};

type ContactLinksClientProps = {
  works: ContactWork[];
};

export default function ContactLinksClient({ works }: ContactLinksClientProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <ul className="flex flex-col items-end gap-16">
      {works.map((work, index) => {
        const blurAmount =
          hoveredIndex !== null && hoveredIndex !== index ? "blur(4px)" : "none";
        return (
          <li
            key={work.id}
            className="transition duration-200"
            style={{ filter: blurAmount }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Link
              href={`/works/${work.slug}`}
              className="flex h-fit w-fit flex-row gap-4"
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
            >
              <div className="flex flex-col justify-center gap-1">
                <span className="text-[18px] font-[800] leading-[1]">
                  {work.name}
                </span>
                <span className="text-[18px] font-[800] leading-[1]">
                  {work.nameEn}
                </span>
              </div>
              <span className="font-yeoleum h-fit pt-[2px] text-[40px] leading-[1]">
                {work.oneWord}
              </span>
              <div className="flex flex-col justify-center gap-1">
                <span className="text-[18px] font-[800] leading-[1]">
                  @{work.instagram}
                </span>
                <span className="text-[18px] font-[800] leading-[1]">
                  {work.email}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
