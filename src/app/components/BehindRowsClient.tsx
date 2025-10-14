"use client";

import HoverBlurRow from "@/app/components/HoverBlurRow";

type ImageItem = {
  url: string;
  alt: string | null;
  caption: string | null;
};

export default function BehindRowsClient({
  rowA,
  rowB,
}: {
  rowA: ImageItem[];
  rowB: ImageItem[];
}) {
  return (
    <div className="group flex h-full flex-col">
      <HoverBlurRow items={rowA} />
      <HoverBlurRow items={rowB} />
    </div>
  );
}
