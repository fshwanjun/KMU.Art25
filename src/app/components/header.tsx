import Link from "next/link";

export default function Header() {
  return (
    <header className="py-4 px-4 fixed top-0 left-0 right-0 z-50">
      <nav className="flex gap-8 font-yeoleum uppercase cursor-pointer">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/works">Works</Link>
        <Link href="/archive" className="hidden">
          Archive
        </Link>
        <Link href="/behind">Behind</Link>
      </nav>
    </header>
  );
}
