import { DFlipViewer } from "@/app/components/dflip-viewer";
import { FG_ABOUT } from "@/lib/constants";
import { fetchBySlug } from "@/lib/wp";
import { getScfData, resolveScfMediaUrl } from "@/lib/scf";

export default async function AboutPage() {
  const aboutPage = await fetchBySlug("pages", "about");
  const aboutData = getScfData(aboutPage, FG_ABOUT);

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
        <DFlipViewer pdfUrl="/kmufa24.pdf" />
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
