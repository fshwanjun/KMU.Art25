const WP_BASE_URL =
  process.env.WP_BASE_URL || "https://kookminfinearts.com/kmufa-25";

type SupportedWpType = "pages" | "posts" | string;

export async function fetchWpNode<T = any>(params: {
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
    // 정적 익스포트 빌드를 위한 캐시 설정
    cache: "force-cache",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WP fetch failed ${res.status} ${res.statusText}: ${text}`);
  }

  return (await res.json()) as T;
}

export type AcfTestResponse = {
  id: number;
  acf?: {
    test?: string | null;
  };
};

export async function fetchAcfTest(params: {
  type: SupportedWpType;
  id: string | number;
}) {
  const data = await fetchWpNode<AcfTestResponse>(params);
  return {
    id: data?.id ?? null,
    test: data?.acf?.test ?? null,
  };
}

export type WpPost = {
  id: number;
  date: string;
  slug: string;
  title?: { rendered?: string };
  acf?: Record<string, unknown> | null;
  _embedded?: Record<string, unknown>;
};

export type WorkAcfGroup = {
  title?: string | null;
  name?: string | null;
};

export type WorkPost = WpPost & {
  acf?:
    | {
        works?: WorkAcfGroup | null;
        work?: WorkAcfGroup | null;
        title?: string | null;
        name?: string | null;
        [key: string]: unknown;
      }
    | WorkAcfGroup
    | null
    | Array<Record<string, unknown>>;
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

function extractEmbeddedTerms(
  embedded: WorkPost["_embedded"]
): WorkCategory[] {
  const terms = embedded?.["wp:term"];
  if (!Array.isArray(terms)) return [];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type NormalizedAcf = Record<string, unknown>;

/**
 * WordPress ACF 응답은 평면 객체, 그룹 객체, `{ name, value }` 배열 등 다양한 형태로 내려옵니다.
 * 이 헬퍼는 모든 경우를 단순한 Record 형태로 정규화해 이후 로직이 일관된 방식으로 접근할 수 있도록 합니다.
 */
export function normalizeAcfFields(acf: WorkPost["acf"]): NormalizedAcf {
  if (!acf) return {};
  if (Array.isArray(acf)) {
    const entries = acf
      .map((entry) => {
        if (!isRecord(entry)) return null;
        const key =
          (typeof entry.name === "string" && entry.name) ||
          (typeof entry.key === "string" && entry.key) ||
          (typeof entry.field === "string" && entry.field);
        if (!key) return null;
        return [key, entry.value] as const;
      })
      .filter(Boolean) as Array<readonly [string, unknown]>;
    return Object.fromEntries(entries);
  }
  if (isRecord(acf)) return acf;
  return {};
}

function readAcfPath(
  acf: NormalizedAcf,
  path: string[]
): unknown {
  return path.reduce<unknown>((acc, key) => {
    if (!acc) return undefined;
    if (!isRecord(acc)) return undefined;
    return acc[key];
  }, acf);
}

function pickFirstString(values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return undefined;
}

/**
 * ACF 필드 값을 문자열로 정제합니다. 배열이나 객체도 안전하게 문자열화하여 UI 레이어에서 추가 방어 로직이 필요 없게 합니다.
 */
export function stringifyAcfValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const flattened = value
      .map((item) => stringifyAcfValue(item))
      .filter((item): item is string => Boolean(item));
    return flattened.length ? flattened.join(", ") : null;
  }
  if (isRecord(value)) {
    return JSON.stringify(value);
  }
  return null;
}

/**
 * 정규화된 ACF 필드들을 반환합니다. 동일한 포스트에서 여러 필드가 필요할 때 재정규화를 피하기 위해 이 결과를 재사용하세요.
 */
export function getWorkAcfFields(work: WorkPost) {
  return normalizeAcfFields(work.acf);
}

type AcfSelector = string | string[];

/**
 * `"title"` 또는 `["works", "title"]`처럼 후보 셀렉터 배열을 순회하며 첫 번째 유효한 문자열을 찾아 반환합니다.
 */
export function resolveAcfText(
  acf: NormalizedAcf,
  selectors: AcfSelector[]
): string | null {
  for (const selector of selectors) {
    const path = Array.isArray(selector) ? selector : [selector];
    const raw = readAcfPath(acf, path);
    const text =
      pickFirstString([raw]) ??
      stringifyAcfValue(raw);
    if (text) return text;
  }
  return null;
}

/**
 * ACF에서 추론한 제목 문자열을 반환합니다.
 */
export function getWorkAcfTitle(
  work: WorkPost,
  acfFields: NormalizedAcf = getWorkAcfFields(work)
) {
  return (
    resolveAcfText(acfFields, [
      ["works", "title"],
      ["works", "work_title"],
      ["work", "title"],
      ["work", "work_title"],
      "title",
      "works_title",
      "work_title",
      "work_title_en",
    ]) ?? null
  );
}

/**
 * ACF에서 추론한 이름 문자열을 반환합니다.
 */
export function getWorkAcfName(
  work: WorkPost,
  acfFields: NormalizedAcf = getWorkAcfFields(work)
) {
  return (
    resolveAcfText(acfFields, [
      ["works", "name"],
      ["works", "work_name"],
      ["work", "name"],
      ["work", "work_name"],
      "name",
      "works_name",
      "work_name",
    ]) ?? null
  );
}

export async function fetchWorksList(
  params: Record<string, string | number | boolean> = {}
) {
  return fetchWpList<WorkPost>(
    "works",
    {
      _embed: "1",
      acf_format: "standard",
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
