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
export function binaryToDecimal(binStr: string, signed = false): number {
  // Validate
  if (!/^[01]+$/.test(binStr)) {
    throw new Error(`Invalid binary string: "${binStr}"`);
  }

  const width = binStr.length;
  const unsignedVal = parseInt(binStr, 2);

  if (!signed) {
    return unsignedVal;
  }

  // signed two's-complement:
  // if highest bit is 0, it's positive; else subtract 2^width
  const isNegative = binStr[0] === "1";
  return isNegative ? unsignedVal - (1 << width) : unsignedVal;
}
export function decimalToBinary(num: number, width: number): string {
  // signed two’s-complement
  if (!Number.isInteger(num)) {
    throw new Error("For signed mode, pass an integer.");
  }
  if (typeof width !== "number" || width < 1) {
    throw new Error(
      "You must specify a positive bit-width for signed conversion."
    );
  }
  // mask to width bits
  const mask = (1 << width) - 1;
  // & mask handles negative wrap-around automatically
  const twos = num & mask;
  // pad to exactly width bits
  return twos.toString(2).padStart(width, "0");
}
