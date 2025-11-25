import WorkImagesClient from "@/app/works/WorkImagesClient";
import { FG_WORK } from "@/lib/constants";
import { getAllWorksParams } from "@/lib/paths";
import { getScfData, resolveScfMediaUrl, ScfResolvedMedia } from "@/lib/scf";
import { decodeSlug } from "@/lib/util";
import { fetchBySlug } from "@/lib/wp";
import { notFound } from "next/navigation";

type WorkNode = {
  acf?: Record<string, unknown>;
};

type WorkDetailParams = {
  slug: string;
};

export async function generateStaticParams() {
  return getAllWorksParams();
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<WorkDetailParams>;
}) {
  const { slug } = await params;
  const slugValue = decodeSlug(slug);
  const work = await fetchBySlug<WorkNode>("works", slugValue, { _embed: "1" });

  if (!work) {
    return notFound();
  }

  const workData = getScfData(work, FG_WORK);
  const gallerySource = (workData as Record<string, unknown>).artgallery as unknown;
  const galleryList = Array.isArray(gallerySource)
    ? gallerySource
    : gallerySource != null
    ? [gallerySource]
    : [];
  const images = await Promise.all(
    galleryList.map((item) => resolveScfMediaUrl(item))
  );

  const contactField =
    (workData.contact as Record<string, unknown> | undefined) ?? undefined;
  const contactInstagramRaw =
    typeof contactField?.["insta"] === "string"
      ? (contactField["insta"] as string)
      : "";
  const contactInstagramList = contactInstagramRaw
    .split(/\s+/)
    .filter((item) => item.trim().length > 0);
  const contactEmail =
    typeof contactField?.["mail"] === "string"
      ? (contactField["mail"] as string)
      : "";

  const title = typeof workData.title === "string" ? workData.title : "";
  const name = typeof workData.name === "string" ? workData.name : "";
  const descriptionRaw = typeof workData.desc === "string" ? workData.desc : "";
  const description = descriptionRaw.replace(/\n/g, "<br />");

  const filteredImages = images.filter(
    (media): media is ScfResolvedMedia => Boolean(media)
  );

  return (
    <div className="relative z-20 mx-auto max-w-[1200px] px-4 md:px-0">
      {/* Mobile Layout: Vertical Stack */}
      <div className="flex flex-col md:hidden gap-2 md:gap-6 pb-20 md:pb-12">
        {/* Title */}
        <h1 className="mb-1">{title}</h1>
        
        {/* Artist Name */}
        <h2>{name}</h2>
        
        {/* Description - No scroll on mobile */}
        <div className="my-6">
          <p dangerouslySetInnerHTML={{ __html: description }} />
        </div>
        
        {/* Contact */}
        <div className="grid grid-cols-3 gap-[20px] mb-8">
          <h2 className="col-span-1 uppercase">Contact</h2>
          <div className="col-span-2 flex flex-col">
            {contactInstagramList.map((instagram, index) => (
              <a
                key={index}
                className=" text-black  hover:text-gray-500 transition-colors duration-200 "
                target="_blank"
                rel="noreferrer"
                href={`https://www.instagram.com/${instagram}`}
              >
                @{instagram}
              </a>
            ))}
            {contactEmail && (
              <a
                className=" text-black  hover:text-gray-500 transition-colors duration-200 "
                target="_blank"
                rel="noreferrer"
                href={`mailto:${contactEmail}`}
              >
                {contactEmail}
              </a>
            )}
          </div>
        </div>
        
        {/* Image Gallery */}
        <div className="flex flex-col gap-8">
          <WorkImagesClient images={filteredImages} />
        </div>
      </div>

      {/* Desktop Layout: Grid (md and above) */}
      <div className="hidden md:grid grid-cols-10 gap-[20px] h-max px-4">
        <div className="col-span-4 xl:col-span-3 sticky top-0 h-fit">
          <h1 className="mb-1">{title}</h1>
          <h2>{name}</h2>
          <div className="max-h-[36em] h-[60vh] overflow-y-auto my-6">
            <p dangerouslySetInnerHTML={{ __html: description }} />
          </div>
          <div className="grid grid-cols-3 gap-[20px]">
            <h2 className="col-span-1 uppercase">Contact</h2>
            <div className="col-span-2 flex flex-col">
              {contactInstagramList.map((instagram, index) => (
                <a
                  key={index}
                  className=" text-black  hover:text-gray-500 transition-colors duration-200 "
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.instagram.com/${instagram}`}
                >
                  @{instagram}
                </a>
              ))}
              {contactEmail && (
                <a
                  className=" text-black  hover:text-gray-500 transition-colors duration-200 "
                  target="_blank"
                  rel="noreferrer"
                  href={`mailto:${contactEmail}`}
                >
                  {contactEmail}
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="col-span-6 col-start-5 flex flex-col gap-8 pb-12">
          <WorkImagesClient images={filteredImages} />
        </div>
      </div>
    </div>
  );
}

