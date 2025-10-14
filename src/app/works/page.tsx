import { fetchListAll } from "@/lib/wp";
import { FG_WORK } from "@/lib/constants";
import { getScfData, resolveScfMediaUrl } from "@/lib/scf";
import WorksGridClient from "@/app/components/WorksGridClient";

export default async function WorksPage() {
  const { items: works } = await fetchListAll("works", {
    per_page: 100,
    page: 1,
  });

  const items = await Promise.all(
    works.map(async (work) => {
      const data = getScfData(work, FG_WORK) as Record<string, unknown>;
      const thumb = await resolveScfMediaUrl(data.thumbnail);
      return { work, data, thumb };
    })
  );

  const gridItems = items.map(({ work, data, thumb }) => ({
    id: work.id,
    slug: work.slug,
    title: (data.title as string) ?? "",
    name: (data.name as string) ?? "",
    thumbnail: thumb?.url
      ? {
          url: thumb.url,
          alt:
            (thumb.alt as string | null | undefined) ??
            ((data.title as string) ?? null),
        }
      : null,
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {works.length === 0 ? (
        <div className="rounded-lg">작품 데이터가 비어 있습니다.</div>
      ) : (
        <WorksGridClient items={gridItems} />
      )}
    </div>
  );
}
