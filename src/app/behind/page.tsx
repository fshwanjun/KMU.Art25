import { FG_BEHIND } from "@/lib/constants";
import { fetchBySlug } from "@/lib/wp";
import { getScfData, resolveScfMediaUrl } from "@/lib/scf";

export default async function BehindPage() {
  const behindPage = await fetchBySlug("pages", "behind");
  const behindData = getScfData(behindPage, FG_BEHIND);
  const rawGallery = (behindData as Record<string, unknown>).behindgallery as
    | unknown[]
    | undefined;
  const images = await Promise.all(
    (rawGallery ?? []).map((item) => resolveScfMediaUrl(item))
  );
  return (
    <div>
      <h1>Behind</h1>
      {images
        .filter(
          (
            m
          ): m is { url: string; alt: string | null; caption: string | null } =>
            Boolean(m)
        )
        .map((m, index) => (
          <div key={index}>
            <img src={m.url} alt={m.alt ?? "behind"} />
            {m.caption && (
              <div dangerouslySetInnerHTML={{ __html: m.caption }} />
            )}
          </div>
        ))}
    </div>
  );
}
