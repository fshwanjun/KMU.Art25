import { FG_ABOUT } from "@/lib/constants";
import { fetchBySlug } from "@/lib/wp";
import { getScfData } from "@/lib/scf";

export default async function AboutPage() {
  const aboutPage = await fetchBySlug("pages", "about");
  const aboutData = getScfData(aboutPage, FG_ABOUT);

  const aboutInfo = aboutData.info as Array<{
    "info-title": string;
    "info-name": string;
  }>;
  return (
    <div>
      <h1>about</h1>
      <h2>{aboutData.host as string}</h2>
      {aboutInfo.map((item, index) => (
        <div key={`${item["info-title"]}-${index}`}>
          <h3>{item["info-title"]}</h3>
          <p>{item["info-name"]}</p>
        </div>
      ))}
    </div>
  );
}
