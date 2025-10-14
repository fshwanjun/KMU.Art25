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
    <div className="relative mx-auto max-w-[1200px] grid grid-cols-10 gap-[20px] h-max">
      <div className="col-span-3 sticky top-0 h-fit">
        <h1 className="mb-1">{workData.title as string}</h1>
        <h2>{workData.name as string}</h2>
        <div className="max-h-[36em] h-[60vh] overflow-y-auto my-6">
          <p>{workData.desc as string}</p>
        </div>
        <div className="grid grid-cols-3 gap-[20px]">
          <h2 className="col-span-1 uppercase">Contact</h2>
          <div className="col-span-2 flex flex-col">
            <a
              className=" text-black  hover:text-gray-500 transition-colors duration-200 "
              target="_blank"
              href={`https://www.instagram.com/${
                (workData.contact as any)?.insta as string
              }`}
            >
              @{(workData.contact as any)?.insta as string}
            </a>
            <a
              className=" text-black  hover:text-gray-500 transition-colors duration-200 "
              target="_blank"
              href={`mailto:${(workData.contact as any)?.mail as string}`}
            >
              {(workData.contact as any)?.mail as string}
            </a>
          </div>
        </div>
      </div>
      <div className="col-span-6 col-start-5 flex flex-col gap-8 pb-12">
        {images
          .filter(
            (
              m
            ): m is {
              url: string;
              alt: string | null;
              caption: string | null;
            } => Boolean(m)
          )
          .map((m, index) => (
            <div
              key={index}
              className="relative w-full flex flex-col items-center justify-center gap-2"
            >
              <img
                src={m.url}
                alt={m.alt ?? "behind"}
                className="w-auto h-auto max-h-[80vh] object-contain"
              />
              {m.caption && (
                <span
                  dangerouslySetInnerHTML={{ __html: m.caption }}
                  className="text-center text-[14px] font-normal text-gray-500"
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
