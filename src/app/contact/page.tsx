import { fetchListAll } from "@/lib/wp";
import { FG_WORK } from "@/lib/constants";
import { getScfData } from "@/lib/scf";
import ContactLinksClient from "@/app/components/ContactLinksClient";
type WorkNode = {
  id: number;
  slug: string;
  acf?: Record<string, unknown>;
};

export default async function ContactPage() {
  const { items: works } = await fetchListAll<WorkNode>("works", {
    per_page: 100,
    page: 1,
  });
  const prepared = works.map((work) => {
    const workData = getScfData(work, FG_WORK);
    const contactField =
      (workData.contact as Record<string, unknown> | undefined) ?? undefined;
    return {
      id: work.id,
      slug: work.slug,
      name: typeof workData.name === "string" ? workData.name : "",
      nameEn: typeof workData.name_en === "string" ? workData.name_en : "",
      oneWord:
        typeof contactField?.["oneword"] === "string"
          ? (contactField["oneword"] as string)
          : "",
      instagram:
        typeof contactField?.["insta"] === "string"
          ? (contactField["insta"] as string)
          : "",
      email:
        typeof contactField?.["mail"] === "string"
          ? (contactField["mail"] as string)
          : "",
    };
  });
  return (
    <div className="pb-24 p-4 mx-auto max-w-[1200px] relative z-20">
      <ContactLinksClient works={prepared} />
    </div>
  );
}
