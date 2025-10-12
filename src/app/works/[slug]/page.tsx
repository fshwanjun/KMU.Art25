import { fetchBySlug } from "@/lib/wp";
import { getAllWorksParams } from "@/lib/paths";
import { decodeSlug } from "@/lib/util";
import { notFound } from "next/navigation";
import { FG_WORK } from "@/lib/constants";
import { getScfData, resolveScfMediaUrl } from "@/lib/scf";

export async function generateStaticParams() {
  return getAllWorksParams();
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await fetchBySlug("works", decodeSlug(slug), { _embed: "1" });
  const workData = getScfData(work, FG_WORK);
  const gallerySource = (workData as Record<string, unknown>)
    .artgallery as unknown;
  const galleryList = Array.isArray(gallerySource)
    ? gallerySource
    : gallerySource != null
    ? [gallerySource]
    : [];
  const images = await Promise.all(
    galleryList.map((item) => resolveScfMediaUrl(item))
  );
  if (!work) {
    return notFound();
  }
  return (
    <div>
      <h1>{workData.title as string}</h1>
      <h2>{workData.name as string}</h2>
      <h2>{workData.name_en as string}</h2>
      <h2>@{(workData.contact as any)?.insta as string}</h2>
      <h2>{(workData.contact as any)?.mail as string}</h2>
      <h2>{(workData.contact as any)?.oneword as string}</h2>
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
