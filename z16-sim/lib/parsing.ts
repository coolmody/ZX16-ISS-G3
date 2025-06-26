// utils/parseZ16.ts

import {
  binToHex,
  instructionFormat,
  littleEndianParser,
  signExtend,
} from "./utils";

const instructions: string[] = [];

const regMap: Record<string, string> = {
  "000": "x0",
  "001": "x1",
  "010": "x2",
  "011": "x3",
  "100": "x4",
  "101": "x5",
  "110": "x6",
  "111": "x7",
};

export default function parseInstructionZ16(raw: string[]): string[] {
  raw = littleEndianParser(raw);
  for (let i = 0; i < raw.length; i++) {
    const instr = raw[i];
    const opcode = instr.slice(13, 16); // bits[15:13] is opcode
    switch (opcode) {
      // ───────────── R-Type  ─────────────
      case "000": {
        const funct4 = instr.slice(0, 4); // bits[15:12]
        const RS2 = regMap[instr.slice(4, 7)]; // bits[11:9] is RS2
        const RD = regMap[instr.slice(7, 10)]; // bits[8:6] is RD/RS1
        const funct3 = instr.slice(10, 13); // bits[12:10]
        //map to the actual instruction name
        const name = instructionFormat("R", funct3, funct4);

        if (!name) {
          instructions.push(`UNKNOWN R (${instr})`);
          continue;
        }
        // MV: dest=RD, src=RS2
        // JR/JALR: only uses RD as target
        if (name === "JR") instructions.push(`${name} ${RD}`);
        else instructions.push(`${name} ${RD}, ${RS2}`);

        continue;
      }
      // ───────────── I-Type ─────────────
      case "001": {
        const imm7 = instr.slice(0, 7); // bits[15:9]
        const RD = regMap[instr.slice(7, 10)]; // bits[8:6] is RS2
        const funct3 = instr.slice(10, 13); // bits[5:3] is RS1
        const name = instructionFormat("I", imm7, funct3);

        if (!name) {
          instructions.push(`UNKNOWN I (${instr})`);
          continue;
        }

        // formatting
        if (["SLLI", "SRLI", "SRAI"].includes(name)) {
          instructions.push(`${name} ${RD}, ${binToHex([imm7.slice(3, 7)])}`);
        } else {
          instructions.push(`${name} ${RD}, ${binToHex([imm7])}`);
        }
        continue;
      }

      // ───────────── B-Type (opcode=010) ─────────────
      case "010": {
        const imm4_1 = instr.slice(0, 4); // bits[15:12]
        const offset = signExtend(imm4_1 + "0", 5);
        const RS2 = regMap[instr.slice(4, 7)]; // bits[11:9] is RS2
        const RS1 = regMap[instr.slice(7, 10)]; // bits[8:6] is RS1
        const funct3 = instr.slice(10, 13); // bits[5:3] is funct3

        const name = instructionFormat("B", funct3);
        if (!name) {
          instructions.push(`UNKNOWN B (${instr})`);
          continue;
        }
        // Z16 uses two regs: RS1 is the “rd/rs1” field, RS2 is the 2nd source
        instructions.push(`${name} ${RS1}, ${RS2}, ${offset}`);
        continue;
      }

      // ───────────── S-Type ─────────────
      case "011": {
        //TODO:checkoffsethandling
        const imm3_0 = instr.slice(0, 4); // bits[15:12]
        const offset = signExtend(imm3_0, 4);
        const RS2 = regMap[instr.slice(4, 7)]; // bits[11:9] is RS2
        const RS1 = regMap[instr.slice(7, 10)]; // bits[8:6] is RS1
        const funct3 = instr.slice(10, 13); // bits[5:3] is funct3
        const name = instructionFormat("S", funct3);
        if (!name) {
          instructions.push(`UNKNOWN B (${instr})`);
          continue;
        }
        instructions.push(`${name} ${RS1}, ${offset}(${RS2})`);
        continue;
      }

      // ───────────── L-Type  ─────────────
      case "100": {
        const imm3_0 = instr.slice(0, 4); // bits[15:12]
        const offset = signExtend(imm3_0, 4);
        const RS2 = regMap[instr.slice(4, 7)]; // bits[11:9] is RS2
        const RD = regMap[instr.slice(7, 10)]; // bits[8:6] is RD
        const funct3 = instr.slice(10, 13); // bits[5:3] is funct3
        const name = instructionFormat("L", funct3);
        if (!name) {
          instructions.push(`UNKNOWN B (${instr})`);
          continue;
        }
        // load: RD ← [BASE+offset]
        instructions.push(`${name} ${RD}, ${offset}(${RS2})`);
        continue;
      }
      // ───────────── J-Type  ─────────────
      case "101": {
        const f = instr.charAt(0); // bit15
        const imm9_4 = instr.slice(1, 7); // bits[14:9]
        const RD = regMap[instr.slice(7, 10)]; // bits[8:6] is RD
        const imm3_1 = instr.slice(10, 13); // bits[5:3]
        const immBits = f + imm9_4 + imm3_1 + "0";
        const offset = signExtend(immBits, 10);
        const name = instructionFormat("J", f);
        if (!name) {
          instructions.push(`UNKNOWN J (${instr})`);
          continue;
        }
        // both use RD as the link/destination register
        if (name === "J") instructions.push(`${name} ${offset}`);
        else instructions.push(`${name} ${RD}, ${offset}`);
        continue;
      }
      // ───────────── U-Type  ─────────────
      case "110": {
        const f = instr.charAt(0); // bit15
        const hi6 = instr.slice(1, 7); // bits[14:9]
        const RD = regMap[instr.slice(7, 10)]; // bits[8:6] is RD
        const lo3 = instr.slice(10, 13); // bits[5:3] is lo3
        // semantic immediate = concat(f,hi6,lo3)
        const immBits = f + hi6 + lo3;
        const immVal = signExtend(immBits, 10);
        const name = instructionFormat("U", f);
        if (!name) {
          instructions.push(`UNKNOWN J (${instr})`);
          continue;
        }
        instructions.push(`${name} ${RD}, ${binToHex([immBits])}`);
        continue;
      }
      // ──────────── SYS-Type  ─────────────
      case "111": {
        const service = instr.slice(0, 10); // bits[15:6]
        const funct3 = instr.slice(10, 13); // bits[5:3] is funct3
        const name = instructionFormat("SYS", funct3);
        if (!name) {
          instructions.push(`UNKNOWN SYS (${instr})`);
          continue;
        }
        instructions.push(`${name} ${service}`);
        if (service === "0000001010") return instructions; // ecall for exit

        continue;
      }
      default:
        instructions.push(`UNKNOWN opcode=${opcode}`);
    }
  }
  return instructions;
}
