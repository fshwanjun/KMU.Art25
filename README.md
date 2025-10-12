This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## GitHub Actions IP 감시 스크립트

Cafe24의 SSH 허용 IP 리스트를 최신 상태로 유지하려면 `scripts/check_github_actions_ips.py`를 주기적으로 실행하세요.

```bash
python scripts/check_github_actions_ips.py
```

- 최초 실행 시 GitHub Actions IP 대역을 `scripts/github_actions_ip_cache.json`에 저장합니다.
- 이후 실행에서는 API에서 가져온 목록과 캐시를 비교해 추가/삭제된 CIDR 블록을 출력하고, 변경사항이 있으면 캐시를 업데이트합니다.
- 출력된 Added/Removed 목록을 Cafe24 관리 콘솔의 SSH 허용 IP 설정에 반영하세요.
