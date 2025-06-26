import parseInstructionZ16 from "./disassembler";
import { binaryToDecimal, decimalToBinary } from "./utils";

export class cpu {
  private memory: string[];
  private PC: number = 0; // Program Counter
  private interruptVector: string[];
  private programCode: string[];
  private MMIO: string[];
  private registers: string[] = Array(8).fill("0000000000000000");
  private words: string[][] = [];
  private halted: boolean = false;
  private paused: boolean = true;

  constructor(memory: string[]) {
    this.memory = memory;
    this.interruptVector = memory.slice(0, 31);
    this.programCode = memory.slice(32, 61439);
    this.MMIO = memory.slice(61440, 65535);
  }

  getAssembly(this: cpu): string[] {
    const parsedInstruction = parseInstructionZ16(this.programCode);
    this.words = parsedInstruction[1];
    return parsedInstruction[0];
  }

  togglePause(this: cpu) {
    this.paused = !this.paused;
  }
  clock(frequencyHz: number, callback: (state: 0 | 1) => void): () => void {
    let state: 0 | 1 = 1;
    const halfPeriodMs = 1000 / (2 * frequencyHz);

    const intervalId = setInterval(() => {
      state = state === 0 ? 1 : 0;
      callback(state);
      if (state === 0 && !this.paused) this.ExecuteInstruction(this.PC);
      if (this.PC >= this.words.length || this.halted) {
        console.log("Program finished execution.");
        clearInterval(intervalId);
        return;
      }
    }, halfPeriodMs);
    // Return a function to stop the clock
    return () => clearInterval(intervalId);
  }
  // Return a function to stop the clock
  getPC(this: cpu) {
    return this.PC;
  }
  getMemory(this: cpu) {
    return this.memory;
  }
  getRegisters(this: cpu) {
    return this.registers;
  }
  getInterruptVector(this: cpu) {
    return this.interruptVector;
  }
  getProgramCode(this: cpu) {
    return this.programCode;
  }
  getMMIO(this: cpu) {
    return this.MMIO;
  }
  setPC(this: cpu, value: number) {
    this.PC = value;
  }
  resetPC(this: cpu) {
    this.PC = 0;
  }
  incrementPC(this: cpu): void {
    this.PC++;
  }
  ExecuteInstruction(this: cpu, index: number): void {
    if (index < 0 || index >= this.words.length) {
      console.error("Index out of bounds");
      return;
    }
    const instruction = this.words[index];

    const operation = instruction[0];
    switch (operation) {
      case "ADD": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) +
            binaryToDecimal(this.registers[rs], true),
          16
        );
        break;
      }
      case "SUB": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) -
            binaryToDecimal(this.registers[rs], true),
          16
        );
        break;
      }
      case "SLT": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) <
            binaryToDecimal(this.registers[rs], true)
            ? 1
            : 0,
          16
        );
        break;
      }
      case "SLTU": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], false) <
            binaryToDecimal(this.registers[rs], false)
            ? 1
            : 0,
          16
        );
        break;
      }
      case "SLL": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) <<
            (binaryToDecimal(this.registers[rs], true) & 15),
          16
        );
        break;
      }
      case "SRL": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) >>
            (binaryToDecimal(this.registers[rs], true) & 15),
          16
        );
        break;
      }
      //TODO: NOT WORKING
      case "SRA": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) >>
            (binaryToDecimal(this.registers[rs], true) & 15),
          16
        );
        break;
      }
      case "OR": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) |
            binaryToDecimal(this.registers[rs], true),
          16
        );
        break;
      }
      case "AND": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) &
            binaryToDecimal(this.registers[rs], true),
          16
        );
        break;
      }
      case "XOR": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) ^
            binaryToDecimal(this.registers[rs], true),
          16
        );
        break;
      }
      case "MV": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rs], true),
          16
        );
        break;
      }
      case "JR": {
        const rd = binaryToDecimal(instruction[1], false);
        this.setPC(binaryToDecimal(this.registers[rd], false));
        break;
      }
      case "JALR": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(this.getPC() + 2, 16);
        break;
      }
      case "ADDI": {
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], true);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) + imm,
          16
        );
        break;
      }
      case "SLTI": {
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], true);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) < imm ? 1 : 0,
          16
        );
        break;
      }
      case "SLTUI ": {
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], false) < imm ? 1 : 0,
          16
        );
        break;
      }
      case "SLLI": {
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) << imm,
          16
        );
        break;
      }
      case "SRLI": {
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) >> imm,
          16
        );
        break;
      }
      //TODO: NOT WORKING
      case "SRAI": {
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) >> imm,
          16
        );
        break;
      }
      case "ORI": {
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], true);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) | imm,
          16
        );
        break;
      }
      case "ANDI": {
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], true);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) & imm,
          16
        );
        break;
      }
      case "XORI": {
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], true);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) ^ imm,
          16
        );
        break;
      }
      case "LI": {
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], true);
        this.registers[rd] = decimalToBinary(imm, 16);
        break;
      }
      case "J": {
        const imm = binaryToDecimal(instruction[1], true);
        this.setPC(this.getPC() + imm / 2);
        return;
      }
      case "ECALL": {
        // Handle system call
        const syscallCode = binaryToDecimal(instruction[1], false);
        this.handleSyscall(syscallCode);
        break;
      }
      default:
        console.error(`Unknown instruction: ${instruction}`);
    }
    this.incrementPC();
    return;
  }
  handleSyscall(this: cpu, syscallCode: number): void {
    switch (syscallCode) {
      case 1: // Print integer
        const reg = binaryToDecimal(this.registers[0], false);
        break;
      case 2: // Read integer
        // Implement read integer logic here
        break;
      case 3: // Print string
        // Implement print string logic here
        break;
      case 4: // Read string
      // Implement read string logic here
      case 10:
        this.halted = true; // Set halted to true to stop execution
        break;
    }
  }
}
