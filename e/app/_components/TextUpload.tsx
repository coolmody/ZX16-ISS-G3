"use client";

import { Button } from "@/components/ui/button";
type Props = {
  onFileRead: (data: string[]) => void; // can also use `string` if joined
};
export default function TextUpload({ onFileRead }: Props) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(buffer);
      // Convert each byte to an 8-character binary string
      const binaryStr = Array.from(bytes).map((byte) =>
        byte.toString(2).padStart(8, "0")
      );
      onFileRead(binaryStr);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 max-w-full">
      <Button asChild>
        <label>
          Upload File
          <input
            type="file"
            accept=".bin"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </Button>
    </div>
  );
}
