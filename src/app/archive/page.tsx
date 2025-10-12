import { FG_ARCHIVE } from "@/lib/constants";
import { fetchBySlug } from "@/lib/wp";
import { getScfData, resolveScfMediaUrl } from "@/lib/scf";

export default async function ArchivePage() {
  const archivePage = await fetchBySlug("pages", "archive");
  const archiveRepeater = getScfData(archivePage, FG_ARCHIVE)
    .archiverepeater as unknown | undefined;
  const rows: Array<Record<string, unknown>> = Array.isArray(archiveRepeater)
    ? (archiveRepeater as Array<Record<string, unknown>>)
    : archiveRepeater
    ? [archiveRepeater as Record<string, unknown>]
    : [];

  const normalized = await Promise.all(
    rows.map(async (row) => {
      const galleryType = (row as Record<string, unknown>)["gallerytype"] as
        | string
        | undefined;
      const galleryRaw = (row as Record<string, unknown>)["repeatergallery"] as
        | unknown[]
        | undefined;
      const images = await Promise.all(
        (galleryRaw ?? []).map((item) => resolveScfMediaUrl(item))
      );
      return {
        galleryType: galleryType ?? null,
        images: images.filter(
          (
            m
          ): m is { url: string; alt: string | null; caption: string | null } =>
            Boolean(m)
        ),
      };
    })
  );
  return (
    <div>
      <h1>Archive</h1>
      {normalized.map((group, idx) => (
        <section key={idx} className="flex flex-row max-w-2xl mx-auto">
          {group.galleryType && <h2>{group.galleryType}</h2>}
          <div className="w-1/2">
            {group.images.map((m, index) => (
              <div key={index}>
                <img src={m.url} alt={m.alt ?? "archive"} />
                {m.caption && (
                  <div dangerouslySetInnerHTML={{ __html: m.caption }} />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
