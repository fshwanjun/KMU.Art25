import { fetchListAll } from "./wp";
import { encodeSlug } from "./util";

type WorkSummary = {
  slug?: string;
};

// 워드프레스에 등록된 모든 작품 포스트의 슬러그를 Next.js 정적 경로 형태로 변환합니다.
export async function getAllWorksParams() {
  const { items } = await fetchListAll<WorkSummary>("works", {
    per_page: 100,
    page: 1,
  });

  return items
    .map((item) => item.slug ?? "")
    .filter((slug) => slug.length > 0)
    .map((slug) => ({ slug: encodeSlug(slug) }));
}
