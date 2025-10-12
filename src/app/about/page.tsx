import { DFlipViewer } from "@/app/components/dflip-viewer";
import { FG_ABOUT } from "@/lib/constants";
import { fetchBySlug } from "@/lib/wp";
import { getScfData, resolveScfMediaUrl } from "@/lib/scf";

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
  return (
    <div>
      <h1>about</h1>
      <h2>{aboutData.title as string}</h2>
      <h3>{aboutData.date as string}</h3>
      {editorHtml && <div dangerouslySetInnerHTML={{ __html: editorHtml }} />}
      <div>
        <a href={catalogHref} target="_blank" rel="noopener noreferrer">
          Download Catalog (PDF)
        </a>
        <DFlipViewer pdfUrl={catalogHref} />
      </div>
      {poster && <img src={poster.url} alt={poster.alt ?? "poster"} />}
      {aboutInfo.map((item, index) => (
        <div key={`${item["info-title"]}-${index}`}>
          <h3>{item["info-title"]}</h3>
          <p>{item["info-name"]}</p>
        </div>
      ))}
    </div>
  );
}
