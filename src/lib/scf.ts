export type ScfDescriptor = {
  title: string;
  fields: Record<string, string>;
};

// Smart Custom Fields가 붙은 워드프레스 노드가 공통적으로 갖는 구조입니다.
type WpNodeWithAcf = {
  acf?: Record<string, unknown>;
};

export type ScfData<T extends ScfDescriptor> = {
  [Key in keyof T["fields"]]: unknown;
};

// 필드 그룹(descriptor)에 정의된 키를 기준으로 ACF 데이터를 읽어옵니다.
export function getScfData<T extends ScfDescriptor>(
  node: WpNodeWithAcf | null | undefined,
  descriptor: T
): ScfData<T> {
  const result: Record<string, unknown> = {};
  const acf = node?.acf ?? {};
  for (const [alias, fieldKey] of Object.entries(descriptor.fields)) {
    const rawValue = (acf as Record<string, unknown>)[fieldKey];
    // Smart Custom Fields는 formatted_value를 제공하므로 우선적으로 사용합니다.
    if (
      rawValue &&
      typeof rawValue === "object" &&
      !Array.isArray(rawValue) &&
      "formatted_value" in (rawValue as Record<string, unknown>)
    ) {
      result[alias] = (rawValue as Record<string, unknown>).formatted_value;
      continue;
    }
    result[alias] = rawValue ?? null;
  }
  return result as ScfData<T>;
}

// SCF/ACF에서 이미지 필드가 숫자 ID나 객체 또는 URL 문자열로 올 수 있어,
// 실제 접근 가능한 이미지 URL로 해석해 반환합니다.
import { fetchWpNode } from "./wp";

export type ScfResolvedMedia = {
  url: string;
  alt: string | null;
  caption: string | null;
};

export async function resolveScfMediaUrl(
  value: unknown
): Promise<ScfResolvedMedia | null> {
  // 이미 완전한 URL 문자열인 경우 메타는 알 수 없으므로 null로 채움
  if (typeof value === "string" && /^(https?:)?\/\//.test(value)) {
    return { url: value, alt: null, caption: null };
  }
  // 객체 형태로 올 때 url/source_url/alt/caption 보유 가능
  if (value && typeof value === "object") {
    const anyValue = value as Record<string, unknown>;
    const directUrl =
      (typeof anyValue.url === "string" && anyValue.url) ||
      (typeof anyValue.source_url === "string" && anyValue.source_url) ||
      null;
    const altFromObj =
      (typeof anyValue.alt === "string" && anyValue.alt) || null;
    const captionFromObj =
      (typeof anyValue.caption === "string" && anyValue.caption) ||
      (typeof (anyValue as any)?.caption?.rendered === "string"
        ? ((anyValue as any).caption.rendered as string)
        : null);
    if (directUrl) {
      return { url: directUrl, alt: altFromObj, caption: captionFromObj };
    }
    // 객체에 id만 있는 경우를 위해 아래 numericId 로직 계속 진행
  }
  // 숫자 ID 또는 숫자 문자열이면 media 엔드포인트로 조회
  const isNumericString = typeof value === "string" && /^\d+$/.test(value);
  const numericId =
    typeof value === "number" ? value : isNumericString ? Number(value) : null;
  if (numericId) {
    const media = await fetchWpNode<any>({ type: "media", id: numericId });
    const url: unknown = media?.source_url ?? media?.guid?.rendered ?? null;
    const alt: unknown = media?.alt_text ?? null;
    const caption: unknown = media?.caption?.rendered ?? null;
    if (typeof url === "string") {
      return {
        url,
        alt: typeof alt === "string" ? alt : null,
        caption: typeof caption === "string" ? caption : null,
      };
    }
    return null;
  }
  return null;
}
