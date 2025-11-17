import NoisyBlurText from "./components/NoisyBlurText";

export default function Home() {
  return (
    <div className="fixed top-0 left-0 h-full w-full overflow-hidden">
      <NoisyBlurText
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/main.png`}
        className="absolute top-0 left-0 w-full h-full z-20"
      />
    </div>
  );
}
