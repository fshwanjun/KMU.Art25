import Link from "next/link";

export default function Header() {
  return (
    <header>
      <h1>KMU Art 2025</h1>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/works">Works</Link>
      </nav>
    </header>
  );
}
