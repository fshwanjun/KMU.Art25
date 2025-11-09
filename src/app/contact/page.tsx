import { fetchListAll } from "@/lib/wp";
import { FG_WORK } from "@/lib/constants";
import { getScfData } from "@/lib/scf";
import ContactLinksClient from "@/app/components/ContactLinksClient";
import BgTitleSvg from "../components/BgTitleSvg";

export default async function ContactPage() {
  const { items: works } = await fetchListAll("works", {
    per_page: 100,
    page: 1,
  });
  const prepared = works.map((work) => {
    const workData = getScfData(work, FG_WORK);
    return {
      id: work.id,
      slug: work.slug,
      name: (workData.name as string) ?? "",
      nameEn: (workData.name_en as string) ?? "",
      oneWord: ((workData.contact as any)?.oneword as string) ?? "",
      instagram: ((workData.contact as any)?.insta as string) ?? "",
      email: ((workData.contact as any)?.mail as string) ?? "",
    };
  });
  return (
    <div className="pb-24 mx-auto max-w-[1200px]">
      <ContactLinksClient works={prepared} />
      <BgTitleSvg addClassName="fixed top-0 left-0 w-full h-full filter blur-[2px]" />
    </div>
  );
}
