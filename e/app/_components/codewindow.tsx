"use client";
import parseInstructionZ16 from "@/lib/disassembler";
import { cn } from "@/lib/utils";
import instructionFormatsByType from "@/lib/z16-INST.json";
import { loader, Monaco } from "@monaco-editor/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import TextUpload from "./TextUpload";
// point the loader at your static files
loader.config({ paths: { vs: "/monaco/vs" } });

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function codeWindow({ className }: { className?: string }) {
  function handleEditorDidMount(editor: any, monaco: Monaco) {
    // 1️⃣ Flatten all mnemonics from the JSON
    const mnemonics = Object.values(instructionFormatsByType).flatMap((group) =>
      Object.keys(group)
    ); // monarch is case-sensitive unless you add /i
    // 2️⃣ Build a single regex: \b(add|sub|...|ecall)\b
    const mnemonicRegex = `\\b(${mnemonics.join("|")})\\b`;

    // 3️⃣ Register your language
    monaco.languages.register({ id: "asm", aliases: ["Assembly", "asm"] });

    // 4️⃣ Set up the Monarch tokenizer using that regex
    monaco.languages.setMonarchTokensProvider("asm", {
      defaultToken: "",
      tokenPostfix: ".asm",
      tokenizer: {
        root: [
          // labels
          [/^[a-zA-Z_]\w*:/, "keyword.i"],

          // instructions (from JSON)
          [new RegExp(mnemonicRegex, "i"), "keyword.r"],

          // registers
          [/\b(x[0-7])\b/i, "variable"],

          // hex numbers
          [/\b0x[0-9A-Fa-f]+\b/, "number.hex"],

          // decimal numbers
          [/\b\d+\b/, "number"],

          // comments
          [/;.*/, "comment"],

          // punctuation
          [/[,\[\]]/, "delimiter"],

          // everything else
          [/[a-zA-Z_]\w*/, "identifier"],
        ],
      },
    });

    // 6️⃣ Finally switch the model to asm
    monaco.editor.defineTheme("asmTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword.r", foreground: "ff5555" },
        { token: "keyword.i", foreground: "55ff55" },
        { token: "variable", foreground: "ccccff" },
        { token: "number.hex", foreground: "ffaa00" },
        { token: "number", foreground: "ffff55" },
        { token: "comment", foreground: "888888", fontStyle: "italic" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
        "editorCursor.foreground": "#ffffff",
        "editorLineNumber.foreground": "#858585",
        "editor.selectionBackground": "#264f78",
      },
    });

    monaco.editor.setTheme("asmTheme");
    monaco.editor.setModelLanguage(editor.getModel()!, "asm");
  }
  const [memory, setMemory] = useState<string[]>([]);
  const interruptVector = memory.slice(0, 31);
  const programCode = memory.slice(32, 61439);
  const MMIO = memory.slice(61440, 65535);
  const Instructions = parseInstructionZ16(programCode);

  return (
    <div className={cn(className)}>
      <div className="w-full h-100 mx-auto">
        <MonacoEditor
          className="h-full"
          theme="vs-dark"
          defaultLanguage="asm"
          value={Instructions.join("\n")}
          onMount={handleEditorDidMount}
          options={{
            readOnly: true, // ← disables all typing
            minimap: { enabled: false },
            contextmenu: false, // optional: disable right-click menu
            lineNumbers: "on",
            glyphMargin: false,
            folding: false,
            overviewRulerLanes: 0,
            overviewRulerBorder: false,
            // disable occurrence/selection highlights (which also draw in the ruler)
            occurrencesHighlight: "off",
            selectionHighlight: false,
            fontSize: 24,
          }}
        />
      </div>
      <div className="p-4 mx-auto flex justify-end">
        <TextUpload onFileRead={setMemory} />
      </div>
    </div>
  );
}
