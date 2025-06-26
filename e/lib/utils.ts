import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function signExtend(bin: string, width: number): number {
  // Ensure the binary string is exactly 'width' bits
  if (bin.length < width) {
    bin = bin.padStart(width, bin[0]); // pad with sign bit
  } else if (bin.length > width) {
    bin = bin.slice(-width); // truncate to the least significant bits
  }
  const unsigned = parseInt(bin, 2);
  const signBit = bin[0] === "1";
  return signBit ? unsigned - (1 << width) : unsigned;
}
export function binToHex(byte: string, reg: boolean = false): string {
  if (!byte) {
    return "";
  }
  return reg
    ? "x" + parseInt(byte, 2).toString(16)
    : "0x" + parseInt(byte, 2).toString(16).padStart(2, "0").toUpperCase();
}
export function littleEndianParser(memory: string[]): string[] {
  const Instructions = memory
    .map((_, index, array) => {
      if (index % 2 === 0 && array[index + 1]) {
        return array[index + 1] + array[index];
      }
      return null;
    })
    .filter((item): item is string => Boolean(item));

  return Instructions;
}
