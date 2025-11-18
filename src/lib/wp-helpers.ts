export type WpRenderedText = {
  rendered?: string | null;
};

export type WpFormattedValue = {
  formatted_value?: unknown;
};

export function isRenderedText(value: unknown): value is WpRenderedText {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (!("rendered" in record)) {
    return false;
  }
  const rendered = record.rendered;
  return (
    typeof rendered === "string" ||
    rendered === null ||
    rendered === undefined
  );
}

export function getRenderedString(value: unknown): string | undefined {
  if (!isRenderedText(value)) {
    return undefined;
  }
  const rendered = value.rendered;
  return typeof rendered === "string" ? rendered : undefined;
}

export function getFormattedValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "formatted_value" in value) {
    const formatted = (value as WpFormattedValue).formatted_value;
    if (formatted == null) {
      return undefined;
    }
    return String(formatted);
  }
  return undefined;
}

