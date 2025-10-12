import Link from "next/link";
import { fetchListAll } from "@/lib/wp";
import { FG_WORK } from "@/lib/constants";
import { getScfData } from "@/lib/scf";

export default async function WorksPage() {
  const { items: works } = await fetchListAll("works", {
    per_page: 100,
    page: 1,
  });

  return (
    <div className="p-6 mx-auto max-w-5xl space-y-6">
      {works.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
          작품 데이터가 비어 있습니다.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => {
            const workData = getScfData(work, FG_WORK);
            return (
              <li key={work.id}>
                <Link
                  href={`/works/${encodeURIComponent(work.slug)}`}
                  className="group block h-full"
                >
                  <h1>{workData.title as string}</h1>
                  <h2>{workData.name as string}</h2>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
