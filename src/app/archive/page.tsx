import { FG_ARCHIVE } from "@/lib/constants";
import { fetchBySlug } from "@/lib/wp";
import { getScfData, resolveScfMediaUrl, ScfResolvedMedia } from "@/lib/scf";
import { twMerge } from "tailwind-merge";
import ArchiveImagesClient from "@/app/archive/ArchiveImagesClient";

type ArchiveNode = {
  acf?: Record<string, unknown>;
};

export default async function ArchivePage() {
  const archivePage = await fetchBySlug<ArchiveNode>("pages", "archive");
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
        images: images.filter((m): m is ScfResolvedMedia => Boolean(m)),
      };
    })
  );
  return (
    <div className="w-full max-w-[1200px] mx-auto p-2 md:p-4">
      {normalized.map((group, idx) => (
        <section key={idx} className="grid grid-cols-10 gap-2 md:gap-[20px] mb-3 md:mb-16">
          {group.galleryType && (
            <h2
              className={twMerge(
                "col-span-3 order-2",
                idx % 2 === 0 ? "text-left" : "text-right"
              )}
            >
              {group.galleryType}
            </h2>
          )}
          <div
            className={twMerge(
              "col-span-7",
              idx % 2 === 0 ? "order-1" : "order-2"
            )}
          >
            <ArchiveImagesClient images={group.images} />
          </div>
        </section>
      ))}
    </div>
  );
}
