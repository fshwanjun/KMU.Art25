import DesktopOnlyNoisyBlurText from "./components/DesktopOnlyNoisyBlurText";

export default function Home() {
  return (
    <div className="fixed top-0 left-0 h-full w-full overflow-hidden">
      <DesktopOnlyNoisyBlurText
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/main.png`}
        className="absolute top-0 left-0 z-20 h-full w-full"
      />
    </div>
  );
}
