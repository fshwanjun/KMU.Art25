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
