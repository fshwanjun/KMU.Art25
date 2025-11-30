"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

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
  const [repeatCount, setRepeatCount] = useState(3);
  const observerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // works 배열을 repeatCount만큼 반복
  const items = Array.from({ length: repeatCount }, () => works).flat();

  useEffect(() => {
    const currentRef = observerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current) {
          isLoadingRef.current = true;
          setRepeatCount((prev) => prev + 2);
          
          // 약간의 딜레이 후 다시 로딩 가능하게
          setTimeout(() => {
            isLoadingRef.current = false;
          }, 100);
        }
      },
      {
        rootMargin: "400px",
        threshold: 0,
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [repeatCount]); // repeatCount가 변경될 때마다 observer 재설정

  return (
    <>
      <ul className="flex flex-col items-end md:items-end gap-16 md:gap-16">
        {items.map((work, index) => {
          const blurAmount =
            hoveredIndex !== null && hoveredIndex !== index
              ? "blur(4px)"
              : "none";
          return (
            <li
              key={`${work.id}-${index}`}
              className="transition duration-200 w-full md:w-auto"
              style={{ filter: blurAmount }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Mobile Layout */}
              <Link
                href={`/works/${work.slug}`}
                className="flex md:hidden flex-col w-full"
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
              >
                <span className="font-yeoleum h-fit pt-[2px] text-[40px] leading-[1] mb-2">
                  {work.oneWord}
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[15px] md:text-[18px] font-[800] leading-[1]">
                      {work.name}
                    </span>
                    <span className="text-[15px] md:text-[18px] font-[800] leading-[1]">
                      {work.nameEn}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {work.instagram && (
                      <span className="text-[15px] md:text-[18px] font-[800] leading-[1]">
                        @{work.instagram}
                      </span>
                    )}
                    {work.email && (
                      <span className="text-[15px] md:text-[18px] font-[800] leading-[1]">
                        {work.email}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Desktop Layout */}
              <Link
                href={`/works/${work.slug}`}
                className="hidden md:flex h-fit w-fit flex-row gap-4"
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
                  {work.instagram && (
                    <span className="text-[18px] font-[800] leading-[1]">
                      @{work.instagram}
                    </span>
                  )}
                  {work.email && (
                    <span className="text-[18px] font-[800] leading-[1]">
                      {work.email}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {/* 트리거 요소 - 이 요소가 보이면 더 로드 */}
      <div 
        ref={observerRef} 
        className="h-20 w-full flex items-center justify-center"
      >
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    </>
  );
}