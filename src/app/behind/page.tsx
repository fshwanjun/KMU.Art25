import { FG_BEHIND } from "@/lib/constants";
import { fetchBySlug } from "@/lib/wp";
import { getScfData, resolveScfMediaUrl } from "@/lib/scf";
import HoverCaptionImage from "@/app/components/HoverCaptionImage";

export default async function BehindPage() {
  const behindPage = await fetchBySlug("pages", "behind");
  const behindData = getScfData(behindPage, FG_BEHIND);
  const rawGallery = (behindData as Record<string, unknown>).behindgallery as
    | unknown[]
    | undefined;
  const images = await Promise.all(
    (rawGallery ?? []).map((item) => resolveScfMediaUrl(item))
  );
  const list = images.filter(
    (m): m is { url: string; alt: string | null; caption: string | null } =>
      Boolean(m)
  );
  const rowA = list.filter((_, i) => i % 2 === 0);
  const rowB = list.filter((_, i) => i % 2 === 1);

  return (
    <div className="fixed top-1/2 left-[52%] -translate-x-1/2 -translate-y-1/2 w-full overflow-x-scroll overflow-y-hidden px-[5%] py-[20%]">
      <div className="flex flex-col h-full">
        <div className="flex flex-row items-center h-[40vh] md:h-[40vh] w-max">
          {rowA.map((m, index) => (
            <HoverCaptionImage
              key={`a-${index}`}
              src={m.url}
              alt={m.alt}
              caption={m.caption}
              className="relative h-full w-auto shrink-0"
            />
          ))}
        </div>
        <div className="flex flex-row items-center h-[40vh] md:h-[40vh] w-max">
          {rowB.map((m, index) => (
            <HoverCaptionImage
              key={`b-${index}`}
              src={m.url}
              alt={m.alt}
              caption={m.caption}
              className="relative h-full w-auto shrink-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
