// utils/parseZ16.ts
import instructionFormatsByType from "./z16-INST.json";

import { binToHex, littleEndianParser, signExtend } from "./utils";
const services: { [key: number]: string } = {
  1: "Read String",
  2: "Read Integer",
  3: "Print String",
  4: "Play tone",
  5: "Set audio volume",
  6: "Stop Audio playback",
  7: "Read the keyboard",
  8: "Registers Dump",
  9: "Memory Dump",
  10: "Program Exit",
};

let instructions: string[] = [];
let lastLabelIndex = 0;
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

export function resolve_label(labelIndex: number): string {
  if (labelIndex < 0 || labelIndex >= instructions.length) {
    console.error("Invalid label index:", labelIndex);
    return "";
  }
  if (instructions[labelIndex].includes("label_"))
    return instructions[labelIndex];
  else {
    const label = `label_${lastLabelIndex}:`;
    instructions.splice(labelIndex, 0, label); // insert the new label at the target index
    lastLabelIndex++; // increment after using the index
    return `label_${lastLabelIndex}`;
  }
}
export default function parseInstructionZ16(raw: string[]): string[] {
  raw = littleEndianParser(raw);
  instructions = new Array(raw.length).fill("");
  let terminate = false;
  for (let i = 0; i < raw.length && !terminate; i++) {
    const instr = raw[i];
    const opcode = instr.slice(13, 16); // bits[15:13] is opcode
    switch (opcode) {
      // ───────────── R-Type  ─────────────
      case "000": {
        const funct4 = instr.slice(0, 4); // bits[15:12]
        const RS2 = instr.slice(4, 7); // bits[11:9] is RS2
        const RD = instr.slice(7, 10); // bits[8:6] is RD/RS1
        const funct3 = instr.slice(10, 13); // bits[12:10]
        //map to the actual instruction name
        const name = instructionFormat("R", funct3, funct4);

        // JR/JALR: only uses RD as target
        if (name === "JR") instructions[i] = `${name} ${binToHex(RD, true)}`;
        else
          instructions[i] = `${name} ${binToHex(RD, true)}, ${binToHex(
            RS2,
            true
          )}`;

        continue;
      }
      // ───────────── I-Type ─────────────
      case "001": {
        const imm7 = instr.slice(0, 7); // bits[15:9]
        const RD = instr.slice(7, 10); // bits[8:6] is RS2
        const funct3 = instr.slice(10, 13); // bits[5:3] is RS1
        const name = instructionFormat("I", imm7, funct3) as string;

        // formatting
        if (["SLLI", "SRLI", "SRAI"].includes(name)) {
          instructions[i] = `${name} ${binToHex(RD, true)}, ${binToHex(
            imm7.slice(3, 7),
            true
          )}`;
        } else {
          instructions[i] = `${name} ${binToHex(RD, true)}, ${binToHex(imm7)}`;
        }
        continue;
      }

      // ───────────── B-Type (opcode=010) ─────────────
      case "010": {
        const imm4_1 = instr.slice(0, 4); // bits[15:12]
        const offset = signExtend(imm4_1 + "0", 5) / 2; // over 2 for Z16
        const RS2 = instr.slice(4, 7); // bits[11:9] is RS2
        const RS1 = instr.slice(7, 10); // bits[8:6] is RS1
        const funct3 = instr.slice(10, 13); // bits[5:3] is funct3
        const label = resolve_label(i + offset);
        const name = instructionFormat("B", funct3);

        // Z16 uses two regs: RS1 is the “rd/rs1” field, RS2 is the 2nd source
        instructions[i] = `${name} ${binToHex(RS1, true)}, ${binToHex(
          RS2,
          true
        )}, ${label}`;
        continue;
      }

      // ───────────── S-Type ─────────────
      case "011": {
        //TODO:checkoffsethandling
        const imm3_0 = instr.slice(0, 4); // bits[15:12]
        const offset = signExtend(imm3_0, 4);
        const RS2 = instr.slice(4, 7); // bits[11:9] is RS2
        const RS1 = instr.slice(7, 10); // bits[8:6] is RS1
        const funct3 = instr.slice(10, 13); // bits[5:3] is funct3
        const name = instructionFormat("S", funct3);

        instructions[i] = `${name} ${binToHex(RS1, true)}, ${offset}(${binToHex(
          RS2,
          true
        )})`;
        continue;
      }

      // ───────────── L-Type  ─────────────
      case "100": {
        const imm3_0 = instr.slice(0, 4); // bits[15:12]
        const offset = signExtend(imm3_0, 4);
        const RS2 = instr.slice(4, 7); // bits[11:9] is RS2
        const RD = instr.slice(7, 10); // bits[8:6] is RD
        const funct3 = instr.slice(10, 13); // bits[5:3] is funct3
        const name = instructionFormat("L", funct3);
        // load: RD ← [BASE+offset]
        instructions[i] = `${name} ${binToHex(RD, true)}, ${offset}(${binToHex(
          RS2,
          true
        )})`;
        continue;
      }
      // ───────────── J-Type  ─────────────
      case "101": {
        const f = instr.charAt(0); // bit15
        const imm9_4 = instr.slice(1, 7); // bits[14:9]
        const RD = instr.slice(7, 10); // bits[8:6] is RD
        const imm3_1 = instr.slice(10, 13); // bits[5:3]
        const immBits = f + imm9_4 + imm3_1 + "0";
        const offset = signExtend(immBits, 10) / 2;
        const label = resolve_label(i + offset);
        const name = instructionFormat("J", f);

        // both use RD as the link/destination register
        if (name === "J") instructions[i] = `${name} ${label}`;
        else instructions[i] = `${name} ${binToHex(RD, true)}, ${label}`;
        continue;
      }
      // ───────────── U-Type  ─────────────
      case "110": {
        const f = instr.charAt(0); // bit15
        const hi6 = instr.slice(1, 7); // bits[14:9]
        const RD = instr.slice(7, 10); // bits[8:6] is RD
        const lo3 = instr.slice(10, 13); // bits[5:3] is lo3
        const immBits = hi6 + lo3;
        const name = instructionFormat("U", f);

        instructions[i] = `${name} ${binToHex(RD, true)}, ${binToHex(immBits)}`;
        continue;
      }
      // ──────────── SYS-Type  ─────────────
      case "111": {
        const service = instr.slice(0, 10); // bits[15:6]
        const funct3 = instr.slice(10, 13); // bits[5:3] is funct3
        const name = instructionFormat("SYS", funct3);
        const serviceName = services[parseInt(service, 2)];

        instructions[i] = `${name} ${parseInt(service, 2)}    # ${serviceName}`;
        if (service === "0000001010") terminate = true; // ecall for exit

        continue;
      }
      default:
        instructions[i] = `UNKNOWN opcode=${opcode}`;
    }
  }
  // Remove empty instructions
  instructions = instructions.filter((instr) => instr.trim() !== "");
  return instructions;
}
