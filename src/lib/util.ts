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

export function cleanCaption(caption: string | null | undefined, keepBr: boolean = false): string | null {
  if (!caption) return null;
  
  let cleaned = caption;
  
  // Remove <p> and </p> tags first (including with attributes and unclosed tags)
  cleaned = cleaned.replace(/<p[^>]*>/gi, ''); // Remove opening <p> tags with any attributes
  cleaned = cleaned.replace(/<\/p>/gi, ''); // Remove closing </p> tags
  
  // Remove <br> and <br/> tags (including with attributes) only if keepBr is false
  if (!keepBr) {
    cleaned = cleaned.replace(/<br\s*\/?>/gi, ''); // Remove <br> and <br/> tags
  }
  
  // Decode HTML entities (e.g., &#8216; -> ')
  // Use manual decoding for both server and client to avoid parsing issues with text like <제목>
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
  
  return cleaned.trim() || null;
}
