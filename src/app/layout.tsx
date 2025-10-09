import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/header";

export const metadata: Metadata = {
  title: "국민대학교 미술학부 회화전공 졸업전시 2025",
  description: "국민대학교 미술학부 회화전공 졸업전시 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
