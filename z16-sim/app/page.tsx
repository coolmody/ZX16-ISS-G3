import Image from "next/image";
import Computer from "./_components/computer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center w-full justify-evenly bg-neutral-950 text-white px-12">
      <Image
        src="/logo.svg"
        alt=""
        width={1000}
        height={10}
        className="bg-transparent"
      />
      <div className="flex flex-row items-center justify-center w-full ">
        <Computer />
      </div>
    </main>
  );
}
