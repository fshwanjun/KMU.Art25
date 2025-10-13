import { fetchListAll } from "@/lib/wp";
import { FG_WORK } from "@/lib/constants";
import { getScfData } from "@/lib/scf";

export default async function ContactPage() {
  const { items: works } = await fetchListAll("works", {
    per_page: 100,
    page: 1,
  });
  return (
    <div className="p-6 mx-auto max-w-3xl space-y-6">
      <h1>Contact</h1>
      <ul className="space-y-4">
        {works.map((work) => {
          const workData = getScfData(work, FG_WORK);
          return (
            <li key={work.id} className="border rounded p-4">
              <div>{workData.name as string}</div>
              <div>{workData.name_en as string}</div>
              <div>@{(workData.contact as any)?.insta as string}</div>
              <div>{(workData.contact as any)?.mail as string}</div>
              <div>{(workData.contact as any)?.oneword as string}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
