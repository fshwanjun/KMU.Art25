"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import BgTitleSvg from "./BgTitleSvg";

export default function MainContainer({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isBehind =
    pathname === "/behind" ||
    (pathname != null && pathname.startsWith("/behind/"));
  const paddingTopClass = isBehind ? "pt-20" : "pt-12 md:pt-40";
  const isHome = pathname === "/";

  useEffect(() => {
    const body = document.body;
    if (isHome) {
      // home 페이지일 때 배경을 흰색으로 변경
      body.style.backgroundColor = "#ffffff";
      body.style.backgroundImage = "none";
    } else {
      // 다른 페이지일 때 배경 이미지 복원
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      body.style.backgroundColor = "";
      body.style.backgroundImage = `url(${basePath}/images/bg.jpg)`;
    }
  }, [isHome]);

  return (
    <main className={twMerge("w-full h-full overflow-auto", paddingTopClass)}>
      {children}
      {!isHome && (
        <BgTitleSvg addClassName="fixed top-0 left-0 w-full h-full filter blur-[2px] z-10 pointer-events-none" />
      )}
    </main>
  );
}
