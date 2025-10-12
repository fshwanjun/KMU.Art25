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
