import NoisyBlurText from "./components/NoisyBlurText";

export default function Home() {
  return (
    <div>
      <NoisyBlurText
        src="/images/main.png"
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
}
