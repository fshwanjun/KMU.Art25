import { fetchAllWorks, fetchWorkBySlug, getWorkCategories } from "@/lib/wp";
import {
  getWorkScfFields,
  getWorkScfName,
  getWorkScfTitle,
} from "@/lib/scf";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export const revalidate = 300;

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await fetchWorkBySlug(slug);

  if (!work) {
    notFound();
  }

  const scfFields = getWorkScfFields(work);
  const scfTitle = getWorkScfTitle(work, scfFields);
  const fallbackTitle = work.title?.rendered || decodeSlug(work.slug);
  const name = getWorkScfName(work, scfFields);
  const categories = getWorkCategories(work);

  return (
    <div className="p-6 mx-auto max-w-3xl space-y-8">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold leading-tight">
          {scfTitle ? (
            scfTitle
          ) : (
            <span dangerouslySetInnerHTML={{ __html: fallbackTitle }} />
          )}
        </h1>
        {name ? <p className="text-lg text-gray-500">{name}</p> : null}
        {categories.length > 0 ? (
          <ul className="flex flex-wrap gap-2 text-sm text-gray-500">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="rounded-full border border-gray-200 px-3 py-1"
              >
                #{cat.name}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <section className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Title
            </dt>
            <dd className="text-base text-gray-900">
              {scfTitle ? (
                scfTitle
              ) : (
                <span dangerouslySetInnerHTML={{ __html: fallbackTitle }} />
              )}
            </dd>
          </div>
          {name ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Name
              </dt>
              <dd className="text-base text-gray-900">{name}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              ID
            </dt>
            <dd className="text-base text-gray-900">{work.id}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  const { items } = await fetchAllWorks({ per_page: 100, page: 1 });
  return items.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await fetchWorkBySlug(slug);
  if (!work) {
    return {
      title: "Work",
    };
  }
  const scfFields = getWorkScfFields(work);
  const scfTitle =
    getWorkScfTitle(work, scfFields) ??
    work.title?.rendered ??
    decodeSlug(work.slug);
  const scfName = getWorkScfName(work, scfFields);

  return {
    title: scfName ? `${scfTitle} – ${scfName}` : scfTitle,
  };
}
