import Link from "next/link";
import { fetchListAll } from "@/lib/wp";
import { FG_WORK } from "@/lib/constants";
import { getScfData, resolveScfMediaUrl } from "@/lib/scf";

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

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {works.length === 0 ? (
        <div className="rounded-lg">작품 데이터가 비어 있습니다.</div>
      ) : (
        <ul className="grid gap-20 grid-cols-3">
          {items.map(({ work, data, thumb }) => (
            <li key={work.id} className="h-fit">
              <Link
                href={`/works/${encodeURIComponent(work.slug)}`}
                className="group h-full flex flex-col items-center justify-start gap-2"
              >
                {thumb?.url ? (
                  <img
                    src={thumb.url}
                    alt={(thumb.alt ?? (data.title as string) ?? "") as string}
                  />
                ) : null}
                <div className="text-center">
                  <h1>{data.title as string}</h1>
                  <p className="text-[14px] font-normal">
                    {data.name as string}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
