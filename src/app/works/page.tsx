import { fetchListAll } from "@/lib/wp";
import { FG_WORK } from "@/lib/constants";
import { getScfData, resolveScfMediaUrl } from "@/lib/scf";
import WorksGridClient from "@/app/components/WorksGridClient";
import BgTitleSvg from "../components/BgTitleSvg";

export default async function WorksPage() {
  const { items: works } = await fetchListAll("works", {
    per_page: 100,
    page: 1,
  });

  const items = await Promise.all(
    works.map(async (work) => {
      const data = getScfData(work, FG_WORK) as Record<string, unknown>;
      const thumb = await resolveScfMediaUrl(data.thumbnail);
      const rawZone = data["zone"] as unknown;
      type ZoneKey = "gallery" | "lobby" | "oneoneone";
      const keyToLabel: Record<ZoneKey, string> = {
        gallery: "Gallery",
        lobby: "Lobby",
        oneoneone: "111호",
      };
      const labelToKey: Record<string, ZoneKey> = {
        Gallery: "gallery",
        Lobby: "lobby",
        "111호": "oneoneone",
      };
      let zoneKey: ZoneKey | null = null;
      let zoneLabel: string | null = null;
      if (typeof rawZone === "string" && rawZone.trim().length > 0) {
        const normalized = rawZone.trim();
        const lower = normalized.toLowerCase();
        if ((lower as string) in keyToLabel) {
          const k = lower as ZoneKey;
          zoneKey = k;
          zoneLabel = keyToLabel[k];
        } else if (normalized in labelToKey) {
          const k = labelToKey[normalized] as ZoneKey;
          zoneKey = k;
          zoneLabel = keyToLabel[k];
        } else {
          // Unknown value; show as label only
          zoneKey = null;
          zoneLabel = normalized;
        }
      } else if (
        rawZone &&
        typeof rawZone === "object" &&
        ("value" in (rawZone as any) || "label" in (rawZone as any))
      ) {
        const valueStr: string | null =
          typeof (rawZone as any).value === "string"
            ? (rawZone as any).value
            : null;
        const labelStr: string | null =
          typeof (rawZone as any).label === "string"
            ? (rawZone as any).label
            : null;
        const lower = (valueStr ?? "").toLowerCase();
        if (lower && (lower as string) in keyToLabel) {
          const k = lower as ZoneKey;
          zoneKey = k;
          zoneLabel = keyToLabel[k];
        } else if (labelStr && labelStr in labelToKey) {
          const k = labelToKey[labelStr] as ZoneKey;
          zoneKey = k;
          zoneLabel = keyToLabel[k];
        } else if (labelStr) {
          zoneKey = null;
          zoneLabel = labelStr;
        }
      }
      return { work, data, thumb, zoneKey, zoneLabel };
    })
  );

  const gridItems = items.map(({ work, data, thumb, zoneKey, zoneLabel }) => ({
    id: work.id,
    slug: work.slug,
    title: (data.title as string) ?? "",
    name: (data.name as string) ?? "",
    zoneKey,
    zoneLabel,
    thumbnail: thumb?.url
      ? {
          url: thumb.url,
          alt:
            (thumb.alt as string | null | undefined) ??
            (data.title as string) ??
            null,
        }
      : null,
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {works.length === 0 ? (
        <div className="rounded-lg">작품 데이터가 비어 있습니다.</div>
      ) : (
        <WorksGridClient items={gridItems} className="z-10" />
      )}

      <BgTitleSvg addClassName="fixed top-0 left-0 w-full h-full filter blur-[2px]" />
    </div>
  );
}
