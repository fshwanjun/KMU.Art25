export function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function encodeSlug(slug: string) {
  return encodeURIComponent(slug);
}

export function cleanCaption(caption: string | null | undefined): string | null {
  if (!caption) return null;
  // Remove <p> </p> tags (including empty, whitespace-only, or with content)
  let cleaned = caption.replace(/<p\s*>([\s\S]*?)<\/p>/gi, "$1");
  // Also remove standalone empty <p> tags
  cleaned = cleaned.replace(/<p\s*>[\s]*<\/p>/gi, "");
  return cleaned.trim() || null;
}
