"use client";

import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname() ?? "";
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const currentPath = pathname.startsWith(base)
    ? pathname.slice(base.length)
    : pathname;
  const links = [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/works", label: "Works" },
    // { href: "/archive", label: "Archive", hidden: true },
    { href: "/behind", label: "Behind" },
  ] as const;

  const isActive = (href: string) =>
    currentPath === href || currentPath.startsWith(`${href}/`);

  return (
    <header className="py-4 px-4 fixed top-0 left-0 right-0 z-50 flex flex-row items-start">
      <Link href="/">
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/title.svg`}
          alt="logo"
          className="w-32 max-h-32"
        />
      </Link>
      <nav className="flex gap-8 font-yeoleum uppercase cursor-pointer">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="relative">
            <div
              className={twMerge(
                " transition filter hover:blur-[2px] capitalize",
                isActive(item.href) ? "blur-[2px]" : ""
              )}
            >
              {item.label}
            </div>
            <img
              src={`${
                process.env.NEXT_PUBLIC_BASE_PATH ?? ""
              }/images/header/${item.label.toLowerCase()}.png`}
              alt={item.label}
              className={twMerge(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto h-full transition-all duration-100 scale-200 pointer-events-none",
                isActive(item.href) ? "scale-200" : "scale-0"
              )}
            />
          </Link>
        ))}
      </nav>
    </header>
  );
}
