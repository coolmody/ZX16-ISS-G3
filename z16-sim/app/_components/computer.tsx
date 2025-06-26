"use client";
import { Button } from "@/components/ui/button";
import { cpu } from "@/lib/cpu";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CodeWindow from "./codewindow";
import KeyboardLayout from "./keyboard";
import Registers from "./registerTable";
import Screen from "./screen";
import Terminal from "./terminal";
import TextUpload from "./TextUpload";

export default function Computer() {
  const [memory, setMemory] = useState<string[]>([]);
  const [clockstate, setClockstate] = useState(0);
  const [PC, setPC] = useState(0);
  const [registers, setRegisters] = useState<string[]>([]);
  const changedIndex: number[] = [];
  const [Assembly, setAssembly] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(true);

  const cpuRef = useRef<cpu | null>(null);
  const updateDisplay = (state: number) => {
    if (!cpuRef.current) return;
    setRegisters(cpuRef.current.getRegisters());
    setPC(cpuRef.current.getPC());
    setClockstate(state);
  };
  useEffect(() => {
    if (memory.length > 0) {
      const cpuinstance = new cpu(memory);
      cpuRef.current = cpuinstance;

      setRegisters(cpuinstance.getRegisters());
      setAssembly(cpuinstance.getAssembly());
      cpuinstance.setPC(0);

      const clock = cpuinstance.clock(2, (state) => {
        updateDisplay(state);
      });
      return () => {
        clock();
      };
    }
  }, [memory]);
  const handlePause = () => {
    if (cpuRef.current) {
      cpuRef.current.togglePause();
      setIsPaused(!isPaused);
    }
  };
  const step = (step: number) => {
    if (cpuRef.current && isPaused) {
      cpuRef.current.setPC(cpuRef.current.getPC() + step);
      updateDisplay(clockstate);
    }
  };

  return (
    <>
      <div className="flex-2/3">
        <div className="flex flex-row items-center justify-between gap-10 p-4">
          <h1>
            Clock:{" "}
            <span className={clockstate ? "text-green-500" : "text-red-700"}>
              {clockstate}
            </span>
          </h1>
          <h1>Pc: {PC}</h1>
          <div className="flex flex-row items-center gap-2">
            <Button
              onClick={() => {}}
              type="submit"
              className="cursor-pointer bg-transparent hover:bg-gray-700 text-white  rounded focus:outline-none focus:shadow-outline "
            >
              <ArrowLeft />
            </Button>
            <Button
              onClick={() => {
                handlePause();
              }}
              type="submit"
              className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isPaused ? "Play" : "Pause"}
            </Button>
            <Button
              onClick={() => {}}
              type="submit"
              className="cursor-pointer  bg-transparent hover:bg-gray-700 text-white rounded focus:outline-none focus:shadow-outline "
            >
              <ArrowRight />
            </Button>
          </div>
        </div>

        <CodeWindow Instructions={Assembly} />
        <div className="p-4 mx-auto flex justify-end">
          <TextUpload onFileRead={setMemory} />
        </div>
        <Terminal />
      </div>
      <div className="flex-1/3 flex flex-col items-center justify-between gap-10">
        <Screen />
        <KeyboardLayout className="w-2/3 " />
        <Registers values={registers} index={changedIndex} />
      </div>
    </>
  );
}
