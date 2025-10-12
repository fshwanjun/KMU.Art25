import { fetchBySlug } from "@/lib/wp";
import { getAllWorksParams } from "@/lib/paths";
import { decodeSlug } from "@/lib/util";
import { notFound } from "next/navigation";
import { FG_WORK } from "@/lib/constants";
import { getScfData } from "@/lib/scf";

export async function generateStaticParams() {
  return getAllWorksParams();
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await fetchBySlug("works", decodeSlug(slug), { _embed: "1" });

  const workData = getScfData(work, FG_WORK);
  if (!work) {
    return notFound();
  }
  return <h1>{workData.title as string}</h1>;
}
