import { WP_BASE_URL } from "./constants";
import type { WorkScfPayload } from "./scf";

type SupportedWpType = "pages" | "posts" | string;

export async function fetchWpNode<T = any>(params: {
  type: SupportedWpType;
  id: string | number;
}): Promise<T> {
  const { type, id } = params;
  // 단일 노드를 가져오기 위해 타입과 ID를 조합한 WP REST URL을 생성합니다.
  const endpoint = `${WP_BASE_URL}/wp-json/wp/v2/${encodeURIComponent(
    type
  )}/${encodeURIComponent(String(id))}`;
  const res = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
    },
    // 정적 익스포트 빌드를 위한 캐시 설정
    cache: "force-cache",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WP fetch failed ${res.status} ${res.statusText}: ${text}`);
  }

  return (await res.json()) as T;
}

export type WpPost = {
  id: number;
  date: string;
  slug: string;
  title?: { rendered?: string };
  scf?: unknown;
  _embedded?: Record<string, unknown>;
};

export type WorkPost = WpPost & {
  scf?: WorkScfPayload;
  _embedded?: {
    "wp:term"?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy?: string;
      }>
    >;
  };
};

type FetchOptions = {
  cache?: RequestCache;
  next?: {
    revalidate?: number;
  };
  headers?: HeadersInit;
};

export async function fetchWpList<T = any>(
  type: SupportedWpType,
  params: Record<string, string | number | boolean> = {},
  options: FetchOptions = {}
): Promise<{ items: T[]; total: number; totalPages: number }> {
  // 워드프레스 목록 API는 쿼리스트링으로 필터링하므로 안전하게 문자열화합니다.
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => qs.set(k, String(v)));
  if (!qs.has("per_page")) qs.set("per_page", "100");
  if (!qs.has("page")) qs.set("page", "1");

  const endpoint = `${WP_BASE_URL}/wp-json/wp/v2/${encodeURIComponent(
    type
  )}?${qs.toString()}`;
  const res = await fetch(endpoint, {
    headers: { Accept: "application/json", ...options.headers },
    cache: options.cache ?? "force-cache",
    next: options.next,
    // 정적 익스포트 빌드를 위한 캐시 설정
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `WP list fetch failed ${res.status} ${res.statusText}: ${text}`
    );
  }
  const total = Number(res.headers.get("X-WP-Total") || 0);
  const totalPages = Number(res.headers.get("X-WP-TotalPages") || 0);
  const items = (await res.json()) as T[];
  return { items, total, totalPages };
}

export async function fetchAllPosts(
  params: Record<string, string | number | boolean> = {}
) {
  const first = await fetchWpList<WpPost>("posts", params);
  const pages = first.totalPages;
  // 첫 페이지의 결과를 기반으로 총 페이지 수를 확인한 뒤 모든 페이지를 순회합니다.
  const results: WpPost[] = [...first.items];
  for (let p = 2; p <= pages; p++) {
    const pageRes = await fetchWpList<WpPost>("posts", { ...params, page: p });
    results.push(...pageRes.items);
  }
  return results;
}

type WorkCategory = {
  id: number;
  name: string;
  slug: string;
};

function extractEmbeddedTerms(embedded: WorkPost["_embedded"]): WorkCategory[] {
  const terms = embedded?.["wp:term"];
  if (!Array.isArray(terms)) return [];
  // 워드프레스는 카테고리를 2차원 배열로 내려주므로 플랫하게 만든 뒤 필요한 속성만 추립니다.
  const categories = terms.flat().filter(
    (
      term
    ): term is {
      id: number;
      name: string;
      slug: string;
      taxonomy?: string;
    } =>
      term &&
      typeof term.id === "number" &&
      typeof term.name === "string" &&
      (!term.taxonomy || term.taxonomy === "category")
  );
  return categories.map(({ id, name, slug }) => ({ id, name, slug }));
}

export function getWorkCategories(work: WorkPost): WorkCategory[] {
  return extractEmbeddedTerms(work._embedded);
}

export async function fetchWorksList(
  params: Record<string, string | number | boolean> = {}
) {
  return fetchWpList<WorkPost>(
    "works",
    {
      _embed: "1",
      ...params,
    },
    {
      cache: "no-store",
    }
  );
}

export async function fetchWorkBySlug(slug: string) {
  const { items } = await fetchWorksList({ slug, per_page: 1 });
  return items[0] ?? null;
}

export async function fetchAllWorks(
  params: Record<string, string | number | boolean> = {}
) {
  const first = await fetchWorksList(params);
  const results = [...first.items];
  const totalPages = first.totalPages || 1;
  for (let page = 2; page <= totalPages; page++) {
    const { items } = await fetchWorksList({ ...params, page });
    results.push(...items);
  }
  return { items: results, total: first.total };
}
