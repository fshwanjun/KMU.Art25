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
  // Decode HTML entities (e.g., &#8216; -> ')
  if (typeof document !== 'undefined') {
    // Browser environment: use DOM to decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = cleaned;
    cleaned = textarea.value;
  } else {
    // Server-side: decode common HTML entities manually
    cleaned = cleaned
      .replace(/&#8216;/g, "'")
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }
  return cleaned.trim() || null;
}
