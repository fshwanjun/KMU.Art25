"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import BgTitleSvg from "./BgTitleSvg";

export default function MainContainer({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isBehind =
    pathname === "/behind" ||
    (pathname != null && pathname.startsWith("/behind/"));
  const paddingTopClass = isBehind ? "pt-20" : "pt-20 md:pt-40";

  return (
    <main className={twMerge("w-full h-full overflow-auto", paddingTopClass)}>
      {children}
      <BgTitleSvg addClassName="fixed top-0 left-0 w-full h-full filter blur-[2px] z-10 pointer-events-none" />
    </main>
  );
}
