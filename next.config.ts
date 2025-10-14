import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export", // 정적 내보내기
  images: { unoptimized: true }, // 이미지 최적화 끔
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "/2025_graduation_exhibition" : "",
  },
  ...(isProd ? { basePath: "/2025_graduation_exhibition" } : {}), // 하위폴더 경로 (프로덕션에서만 적용)
  trailingSlash: true, // 각 페이지를 폴더형 index.html로
};

export default nextConfig;
