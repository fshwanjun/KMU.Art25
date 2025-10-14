import { FG_BEHIND } from "@/lib/constants";
import { fetchBySlug } from "@/lib/wp";
import { getScfData, resolveScfMediaUrl } from "@/lib/scf";
import HorizontalWheelScroller from "@/app/components/HorizontalWheelScroller";
import BehindRowsClient from "./../components/BehindRowsClient";

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
    <HorizontalWheelScroller className="fixed top-1/2 left-[52%] -translate-x-1/2 -translate-y-1/2 w-full overflow-x-scroll overflow-y-hidden px-[5%] py-[20%]">
      <BehindRowsClient rowA={rowA} rowB={rowB} />
    </HorizontalWheelScroller>
  );
}
