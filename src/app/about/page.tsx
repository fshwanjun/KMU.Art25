import { DFlipViewer } from "@/app/components/dflip-viewer";
import { FG_ABOUT } from "@/lib/constants";
import { fetchBySlug } from "@/lib/wp";
import { getScfData, resolveScfMediaUrl } from "@/lib/scf";
import BgTitleSvg from "../components/BgTitleSvg";

export default async function AboutPage() {
  const aboutPage = await fetchBySlug("pages", "about");
  const aboutData = getScfData(aboutPage, FG_ABOUT);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const trimmedBase = basePath.replace(/^\/|\/$/g, "");
  const catalogHref = `/${trimmedBase ? `${trimmedBase}/` : ""}kmufa24.pdf`;

  const aboutInfo = aboutData.info as Array<{
    "info-title": string;
    "info-name": string;
  }>;
  const poster = await resolveScfMediaUrl(aboutData.poster as unknown);
  const editorHtml = (aboutPage as any)?.content?.rendered as
    | string
    | undefined;
  const dateRaw = aboutData.date as unknown;
  const dateHtml = Array.isArray(dateRaw)
    ? dateRaw.join("<br />")
    : typeof dateRaw === "object" &&
      dateRaw &&
      "formatted_value" in (dateRaw as Record<string, unknown>)
    ? String((dateRaw as any).formatted_value ?? "")
    : typeof dateRaw === "string"
    ? (dateRaw as string).replace(/\n/g, "<br />")
    : "";
  return (
    <div className="w-full p-4 max-w-[1000px] mx-auto relative z-20">
      <div className="relative top-0 left-0 grid grid-cols-10 gap-[20px] mb-12">
        <section className="col-span-10 md:col-span-5 [@media(min-width:1200px)]:col-span-4 relative top-0 left-0 w-full h-full">
          {poster && (
            <img
              className="relative md:sticky top-0 md:max-h-2/3 w-full object-contain"
              src={poster.url}
              alt={poster.alt ?? "poster"}
              draggable={false}
            />
          )}
        </section>
        <section className="col-span-10 col-start-1 md:col-span-5 md:col-start-6 flex flex-col gap-8">
          <div>
            <h2>{aboutData.title as string}</h2>
            {dateHtml && <h3 dangerouslySetInnerHTML={{ __html: dateHtml }} />}
          </div>
          {editorHtml && (
            <div dangerouslySetInnerHTML={{ __html: editorHtml }} />
          )}
          <div>
            {aboutInfo.map((item, index) => (
              <div
                key={`${item["info-title"]}-${index}`}
                className="grid gap-4 grid-cols-5 mb-3"
              >
                <p className="col-span-2">{item["info-title"]}</p>
                <p className="col-span-3">{item["info-name"]}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mb-12">
        <DFlipViewer pdfUrl={catalogHref} className="bg-gray-500" />
      </div>
    </div>
  );
}
