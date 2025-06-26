import CodeWindow from "./_components/codewindow";
import Screen from "./_components/screen";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-row items-center w-full justify-evenly bg-gray-900 text-white p-12">
      <CodeWindow className="flex-2/3" />
      <Screen className="flex-1/3 " />
    </main>
  );
}
