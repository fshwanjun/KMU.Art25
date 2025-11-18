import { WP_BASE_URL } from "./constants";

type SupportedWpType = "pages" | "posts" | string;
type WpPrimitive = string | number | boolean;
type WpQueryValue = WpPrimitive | ReadonlyArray<WpPrimitive>;
export type WpQueryParams = Record<string, WpQueryValue | undefined>;

export type WpCollectionResult<T> = {
  items: T[];
  total: number;
  totalPages: number;
};

// 워드프레스 REST API에 전달할 쿼리 파라미터를 안전하게 문자열화합니다.
function createSearchParams(params: WpQueryParams = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        searchParams.append(key, String(entry));
      }
      continue;
    }
    searchParams.append(key, String(value));
  }
  return searchParams;
}

// 응답 헤더에 포함된 숫자 값을 정수로 변환하고, 실패 시 기본값을 사용합니다.
function parseHeaderInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// 페이지 번호처럼 양수 정수만 허용되는 파라미터를 정제합니다.
function toPositiveInt(value: WpQueryValue | undefined) {
  if (value === undefined) {
    return undefined;
  }
  const candidate = Array.isArray(value) ? value[0] : value;
  const numeric =
    typeof candidate === "number" ? candidate : Number(candidate);
  if (!Number.isFinite(numeric) || numeric < 1) {
    return undefined;
  }
  return Math.floor(numeric);
}

// 목록 응답을 한 페이지 단위로 가져오는 공통 fetch 함수입니다.
async function fetchWpCollectionPage<T>(
  type: SupportedWpType,
  params: WpQueryParams = {}
): Promise<WpCollectionResult<T>> {
  const searchParams = createSearchParams(params);
  const query = searchParams.toString();
  const endpoint = `${WP_BASE_URL}/wp-json/wp/v2/${encodeURIComponent(
    type
  )}${query ? `?${query}` : ""}`;
  const res = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
    },
    cache: "force-cache",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WP list fetch failed ${res.status} ${res.statusText}: ${text}`);
  }

  const items = (await res.json()) as T[];
  const total = parseHeaderInt(res.headers.get("X-WP-Total"), items.length);
  const totalPages = parseHeaderInt(res.headers.get("X-WP-TotalPages"), 1);
  return { items, total, totalPages };
}

// 단일 노드를 id로 조회합니다.
export async function fetchWpNode<T = unknown>(params: {
  type: SupportedWpType;
  id: string | number;
}): Promise<T> {
  const { type, id } = params;
  const endpoint = `${WP_BASE_URL}/wp-json/wp/v2/${encodeURIComponent(
    type
  )}/${encodeURIComponent(String(id))}`;
  const res = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
    },
    cache: "force-cache",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WP fetch failed ${res.status} ${res.statusText}: ${text}`);
  }

  return (await res.json()) as T;
}

// 페이지네이션 응답을 모두 이어붙여 반환합니다.
export async function fetchListAll<T = unknown>(
  type: SupportedWpType,
  params: WpQueryParams = {}
): Promise<WpCollectionResult<T>> {
  const startPage = toPositiveInt(params.page) ?? 1;
  const baseParams: WpQueryParams = {
    ...params,
    page: startPage,
  };
  const firstPage = await fetchWpCollectionPage<T>(type, baseParams);
  if (firstPage.totalPages <= startPage) {
    return firstPage;
  }

  const items = [...firstPage.items];
  for (let page = startPage + 1; page <= firstPage.totalPages; page += 1) {
    const nextPage = await fetchWpCollectionPage<T>(type, {
      ...baseParams,
      page,
    });
    items.push(...nextPage.items);
  }

  return {
    items,
    total: firstPage.total,
    totalPages: firstPage.totalPages,
  };
}

// 슬러그로 특정 게시물을 찾아 반환합니다.
export async function fetchBySlug<T = unknown>(
  type: SupportedWpType,
  slug: string,
  params: WpQueryParams = {}
): Promise<T | null> {
  const mergedParams: WpQueryParams = {
    ...params,
    slug,
    per_page: 1,
    page: 1,
  };
  const { items } = await fetchWpCollectionPage<T>(type, mergedParams);
  return items[0] ?? null;
}
