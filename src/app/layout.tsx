import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/header";
import localFont from "next/font/local";
import { twMerge } from "tailwind-merge";
import LightboxProvider from "./components/LightboxProvider";

const hsYeoleum = localFont({
  src: "../../public/fonts/HSYeoleum.woff",
  display: "swap",
  variable: "--font-yeoleum",
});

const suite = localFont({
  src: [
    { path: "../../public/fonts/SUITE-Light.woff2", weight: "300" },
    { path: "../../public/fonts/SUITE-Regular.woff2", weight: "400" },
    { path: "../../public/fonts/SUITE-Medium.woff2", weight: "500" },
    { path: "../../public/fonts/SUITE-SemiBold.woff2", weight: "600" },
    { path: "../../public/fonts/SUITE-Bold.woff2", weight: "700" },
    { path: "../../public/fonts/SUITE-ExtraBold.woff2", weight: "800" },
    { path: "../../public/fonts/SUITE-Heavy.woff2", weight: "900" },
  ],
  display: "swap",
  variable: "--font-suite",
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
      <body
        className={twMerge(
          "antialiased font-suite bg-fixed bg-center bg-cover bg-no-repeat",
          hsYeoleum.variable,
          suite.variable
        )}
        style={{
          backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/bg.jpg)`,
        }}
      >
        <LightboxProvider>
          <Header />
          <main className="px-4 pt-20 w-full h-full overflow-auto">
            {children}
          </main>
        </LightboxProvider>
      </body>
    </html>
  );
}
