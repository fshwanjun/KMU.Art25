"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export default function MainContainer({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isBehind =
    pathname === "/behind" ||
    (pathname != null && pathname.startsWith("/behind/"));
  const paddingTopClass = isBehind ? "pt-20" : "pt-40";

  return (
    <main
      className={twMerge("px-4 w-full h-full overflow-auto", paddingTopClass)}
    >
      {children}
    </main>
  );
}
