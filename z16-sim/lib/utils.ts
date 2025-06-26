import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import instructionFormatsByType from "./z16-INST.json";

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

export function binToHex(mem: string[]): string[] {
  if (!mem || !mem.length) {
    return [];
  }
  return mem.map((byte) => {
    const hex = "0x" + parseInt(byte, 2).toString(16).padStart(2, "0");
    return hex;
  });
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
export function instructionFormat(
  Type: string,
  ...args: string[]
): string | undefined {
  let entry: any;
  switch (Type) {
    case "R": {
      const [funct3, funct4] = args;
      entry = Object.entries(instructionFormatsByType[Type]).find(
        ([, fmt]) => fmt.funct3 === funct3 && fmt.funct4 === funct4
      );
      break;
    }
    case "I": {
      const [imm7, funct3] = args;
      entry = Object.entries(instructionFormatsByType.I).find(
        ([, fmt]) => fmt.funct3 === funct3
      );
      if (funct3 === "011") {
        entry = [];
        entry[0] =
          imm7.slice(0, 3) === "001"
            ? "SLLI"
            : imm7.slice(0, 3) === "010"
            ? "SRLI"
            : imm7.slice(0, 3) === "100"
            ? "SRAI"
            : undefined;
      }
      break;
    }
    case "B": {
      const [funct3] = args;
      entry = Object.entries(instructionFormatsByType.B).find(
        ([, fmt]) => fmt.funct3 === funct3
      );
      break;
    }
    case "S": {
      const [funct3] = args;
      entry = Object.entries(instructionFormatsByType.S).find(
        ([, fmt]) => fmt.funct3 === funct3
      );
      break;
    }
    case "L": {
      const [funct3] = args;
      entry = Object.entries(instructionFormatsByType.L).find(
        ([, fmt]) => fmt.funct3 === funct3
      );
      break;
    }
    case "J": {
      const [f] = args;
      entry = Object.entries(instructionFormatsByType.J).find(
        ([, fmt]) => fmt.flag === f
      );
      break;
    }
    case "U": {
      const [f] = args;
      entry = Object.entries(instructionFormatsByType.U).find(
        ([, fmt]) => fmt.flag === f
      );
      break;
    }
    case "SYS": {
      const [funct3] = args;
      entry = Object.entries(instructionFormatsByType.SYS).find(
        ([, fmt]) => fmt.funct3 === funct3
      );
      break;
    }
  }
  return entry && entry[0] ? entry[0] : undefined;
}
