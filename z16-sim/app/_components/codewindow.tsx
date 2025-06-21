"use client";
import parseInstructionZ16 from "@/lib/parsing";
import { binToHex, memoryToWords } from "@/lib/utils";
import React, { useMemo, useState } from "react";
import HighlightedText from "./HiglightedText";
import TextUpload from "./TextUpload";

export default function codeWindow() {
  const [memory, setMemory] = useState<string[]>([]);
  const memoryByWords = memoryToWords(memory.slice(32, 250));
  const Instructions = parseInstructionZ16(memoryByWords);

  return (
    <>
      <div className="p-4 mx-auto flex justify-center">
        <TextUpload onFileRead={setMemory} />
      </div>
      <div className="w-4/5 h-100 mx-auto border-2 border-emerald-500 rounded-lg">
        <HighlightedText content={Instructions.join("\n")} className="h-full" />
      </div>
    </>
  );
}
