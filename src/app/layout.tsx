import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/header";
import localFont from "next/font/local";
import { twMerge } from "tailwind-merge";

const hsYeoleum = localFont({
  src: "../../public/fonts/HSYeoleum.woff",
  display: "swap",
  variable: "--font-yeoleum",
});

export const metadata: Metadata = {
  title: "국민대학교 미술학부 회화전공 졸업전시 2025",
  description: "국민대학교 미술학부 회화전공 졸업전시 2025",
};

export const dynamic = "force-static";
export const revalidate = 300;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={twMerge("antialiased font-suite")}>
        <Header />
        {children}
      </body>
    </html>
  );
}
