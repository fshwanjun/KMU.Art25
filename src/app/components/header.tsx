"use client";

import { useEffect, useState } from "react";
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
    // { href: "/archive", label: "Archive" },
    { href: "/behind", label: "Behind" },
  ] as const;

  const isActive = (href: string) =>
    currentPath === href || currentPath.startsWith(`${href}/`);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPath]);
  const activeLink = links.find((item) => isActive(item.href));
  const isHomeActive = currentPath === "/" || currentPath === "";
  const activeDisplay = isHomeActive
    ? { href: "/", label: "Home" }
    : activeLink ?? null;
  const activeImageSrc = activeDisplay
    ? activeDisplay.label.toLowerCase() === "home"
      ? `${base}/images/main.png`
      : `${base}/images/header/${activeDisplay.label.toLowerCase()}.png`
    : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex w-full flex-row items-start gap-4 p-2 md:w-fit md:gap-8 md:p-4">
      <Link href="/" className="hidden md:block">
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/title.svg`}
          alt="logo"
          className="w-32 max-h-32"
        />
      </Link>
      <div
        className="font-yeoleum uppercase md:hidden p-0 fixed cursor-pointer top-2 right-2 py-1 px-2 z-50"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-nav"
      >
        <svg width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 10H0V8H20V10ZM13 6H0V4H13V6ZM20 2H0V0H20V2Z" fill="#231916"/>
        </svg>
      </div>
      {!isMenuOpen && activeDisplay && (
        <Link
          href={activeDisplay.href}
          className="relative font-yeoleum uppercase md:hidden flex items-center justify-center px-0 py-0 md:px-2 md:py-1"
        >
          <span
            className={twMerge(
              "transition filter capitalize",
              "md:blur-[2px]"
            )}
          >
            {activeDisplay.label}
          </span>
          {activeImageSrc && (
            <img
              src={activeImageSrc}
              alt={activeDisplay.label}
              className={twMerge(
                "pointer-events-none absolute top-1/2 left-1/2 w-auto -translate-x-1/2 -translate-y-1/2 scale-200 opacity-80 hidden md:blcok",
                activeDisplay.label.toLowerCase() === "home"
                  ? "h-24"
                  : "h-full"
              )}
            />
          )}
        </Link>
      )}
      <nav
        id="mobile-nav"
        className={twMerge(
          "font-yeoleum uppercase md:hidden flex-col gap-2",
          isMenuOpen ? "flex" : "hidden"
        )}
      >
        <Link href="/">
          <div
            className={twMerge(
              "transition capitalize font-yeoleum"
            )}
          >
            Home
          </div>
        </Link>
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="relative">
            <div
              className={twMerge(
                "transition filter hover:blur-[2px] capitalize",
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
                "pointer-events-none absolute top-1/2 left-1/2 h-full w-auto -translate-x-1/2 -translate-y-1/2 scale-200 transition-all duration-100",
                isActive(item.href) ? "scale-200" : "scale-0"
              )}
            />
          </Link>
        ))}
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/main.png`}
          alt="menu"
          className="absolute top-0 right-0 w-[268px] top-2.5 right-3 md:hidden"
        />
      </nav>
      <nav className="gap-8 font-yeoleum uppercase hidden md:flex flex-row">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="relative">
            <div
              className={twMerge(
                "transition filter hover:blur-[2px] capitalize",
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
