import Link from "next/link";
export default function Header() {
  return (
    <header className="py-4 px-4 fixed top-0 left-0 right-0 z-50 flex flex-row items-start">
      <Link href="/">
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/home.png`}
          alt="logo"
          className="w-auto max-h-32"
        />
      </Link>
      <nav className="flex gap-8 font-yeoleum uppercase cursor-pointer">
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
