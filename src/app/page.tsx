import NoisyBlurText from "./components/NoisyBlurText";

export default function Home() {
  return (
    <div className="fixed top-0 left-0 h-full w-full overflow-hidden">
      <NoisyBlurText
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/main.png`}
        className="absolute top-0 left-0 w-full h-full z-10"
      />
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <img
          className="absolute h-3/7 -top-[15%] right-[5%] opacity-30"
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/title-1.svg`}
          alt="title 1"
        />
        <img
          className="absolute h-3/7 top-1/2 -translate-y-1/2 left-[10%] opacity-30"
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/title-2.svg`}
          alt="title 2"
        />
        <img
          className="absolute h-3/7 -bottom-[15%] right-[15%] opacity-30"
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/title-3.svg`}
          alt="title 3"
        />
      </div>
    </div>
  );
}
