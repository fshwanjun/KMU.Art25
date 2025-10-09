import Link from "next/link";
import {
  fetchAllWorks,
  getWorkAcfFields,
  getWorkAcfName,
  getWorkAcfTitle,
  getWorkCategories,
} from "@/lib/wp";

export const dynamic = "force-static";
export const revalidate = 300;

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export default async function WorksPage() {
  const { items: works } = await fetchAllWorks({
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
            const acfFields = getWorkAcfFields(work);
            const acfTitle = getWorkAcfTitle(work, acfFields);
            const fallbackTitle = work.title?.rendered || decodeSlug(work.slug);
            const name = getWorkAcfName(work, acfFields);
            const categories = getWorkCategories(work);
            return (
              <li key={work.id}>
                <Link
                  href={`/works/${encodeURIComponent(work.slug)}`}
                  className="group block h-full"
                >
                  <article className="flex h-full flex-col justify-between rounded-lg border border-gray-200 p-4 transition hover:border-gray-900 hover:shadow-sm">
                    <header className="space-y-2">
                      <h2 className="text-lg font-semibold leading-tight text-gray-900 group-hover:text-black">
                        {acfTitle ? (
                          acfTitle
                        ) : (
                          <span
                            dangerouslySetInnerHTML={{ __html: fallbackTitle }}
                          />
                        )}
                      </h2>
                      {name ? (
                        <p className="text-sm text-gray-500">{name}</p>
                      ) : null}
                    </header>
                    {categories.length > 0 ? (
                      <ul className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                        {categories.map((cat) => (
                          <li
                            key={cat.id}
                            className="rounded-full border border-gray-200 px-2 py-0.5"
                          >
                            #{cat.name}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
