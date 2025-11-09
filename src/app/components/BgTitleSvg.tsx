import { twMerge } from "tailwind-merge";

export default function BgTitleSvg({
  addClassName,
}: {
  addClassName?: string;
}) {
  return (
    <div
      className={twMerge(
        "absolute top-0 left-0 w-full h-full z-0 pointer-events-none",
        addClassName
      )}
    >
      <img
        className="absolute h-3/7 -top-[15%] right-[5%] opacity-30"
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/title-1.svg`}
        alt="title 1"
        draggable={false}
      />
      <img
        className="absolute h-3/7 top-1/2 -translate-y-1/2 left-[10%] opacity-30"
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/title-2.svg`}
        alt="title 2"
        draggable={false}
      />
      <img
        className="absolute h-3/7 -bottom-[15%] right-[15%] opacity-30"
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/title-3.svg`}
        alt="title 3"
        draggable={false}
      />
    </div>
  );
}
