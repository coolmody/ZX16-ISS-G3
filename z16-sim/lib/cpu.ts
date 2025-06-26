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
      //start of R-Type operations
      case "ADD": {
        // ADD  rd ,rs  = rd =rd + rs
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
        // SUB  rd ,rs  = rd =rd - rs
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
        //ASK why isnt those 2 not set to true instead of false
        // SLT rd, rs = rd = (rd < rs)  true/false (signed comparison)
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) <
            binaryToDecimal(this.registers[rs], true)
            ? 1  //true
            : 0,  //false
          16
        );
        break;
      }
      case "SLTU": {
        // SLTU rd, rs = rd = (rd < rs)  true/false (unsigned comparison)
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
        // SLL logical shift left  rd= rd << rs 
        // OR rd = rd shifted to the left by amount of rs
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
        // SRL logical shift right  rd= rd >> rs
        // OR rd = rd shifted to the right by amount of rs
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
      // SRA is arithmetic shift right, it should keep the sign bit
      // SRA rd, rs = rd = rd >> rs (arithmetic shift right)
      case "SRA": {
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) >>
            (binaryToDecimal(this.registers[rs], true) & 15),
          16
        );
        // an attempt
        //const rd = binaryToDecimal(instruction[1], false);
        //const rs = binaryToDecimal(instruction[2], false);
        //const x = this.registers[rd][8] === "1" ? 1 : 0; // check if the first bit is 1 (signed)
        //if (x == 0){
        //  
        //      this.registers[rd] = decimalToBinary(
        //  binaryToDecimal(this.registers[rd], true) >>
        //    (binaryToDecimal(this.registers[rs], true) & 15),
          //16
      //  );
        //else
       //const rd_signed= binaryToDecimal(this.registers[rd], true);
       //const shifts = binaryToDecimal(this.registers[rs], true) & 15;
       // this.registers[rd] = decimalToBinary(value >> shift, 16);
       //ATTEMPT 2 
       //const rd = binaryToDecimal(instruction[1], false);
        //const rs = binaryToDecimal(instruction[2], false);
        //const x = 0
        //if (this.registers[rd][8] === "1") { // check if the first bit is 1 (signed){
        // while (x != rs){
        ///this.registers[rd] = decimalToBinary(
          //binaryToDecimal(this.registers[rd], true) >> 1
           // 
         //
         //this.registers[rd] = decimalToBinary(
          //binaryToDecimal(this.registers[rd], true) + 0x80 ,
          //16
        //);
        //x++;
      //}
        //this.registers[rd] = decimalToBinary(
          //binaryToDecimal(this.registers[rd], true) >>
           // (binaryToDecimal(this.registers[rs], true) & 15),
         // 16
        //);

       break;
      }
      case "OR": {
        //bit wise operation OR
        // OR rd, rs = rd = rd | rs
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
        // bit wise operation AND
        // AND rd, rs = rd = rd & rs
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
        // bit wise operation XOR
        // XOR rd, rs = rd = rd ^ rs
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
        // MV not a core instruction but psudo instruction of ADD
        // MV rd, rs = rd = rs
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rs], true),
          16
        );
        break;
      }
      case "JR": {
        // JR jump to address in register
        // JR rd = PC = rd
        // This instruction sets the program counter to the value in the specified register.
        const rd = binaryToDecimal(instruction[1], false);
        this.setPC(binaryToDecimal(this.registers[rd], false));
        break;
      }
      case "JALR": {
        // JALR jump and link register
        // JALR rd, rs = PC = rd; rd = PC + 2
        const rd = binaryToDecimal(instruction[1], false);
        const rs = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(this.getPC() + 2, 16);
        break;
      }
      //end of R-Type operations
      //start of I-Type operations 
      case "ADDI": {
        // ADDI rd, imm = rd = rd + imm
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], true);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) + imm,
          16
        );
        break;
      }
      case "SLTI": {
        // SLTI rd, imm = rd = (rd < imm)  true/false (signed comparison)
        //set less than immediate
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], true);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) < imm ? 1 : 0,
          16
        );
        break;
      }
      case "SLTUI ": {
        // SLTUI rd, imm = rd = (rd < imm)  true/false (unsigned comparison)
        //set less than unsigned immediate
        //sets rd with either 1 or 0 depending on the comparison
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], false) < imm ? 1 : 0,
          16
        );
        break;
      }
      case "SLLI": {
        // SLLI rd, imm = rd = rd << imm
        //logical shift left immediate
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) << imm,
          16
        );
        break;
      }
      case "SRLI": {
        //  SRLI rd, imm = rd = rd >> imm
        //logical shift right immediate
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
        // SRAI rd, imm = rd = rd >> imm (arithmetic shift right immediate)
        // This instruction performs an arithmetic right shift on the value in rd by the amount specified in imm.
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], false);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) >> imm,
          16
        );
        break;
        // SRAI attempt 1
        //const rd = binaryToDecimal(instruction[1], false);
        //const imm = binaryToDecimal(instruction[2], false);
        //const x= this.registers[rd][0] === "1" ? 1 : 0; // check if the first bit is 1 (signed)
        //this.registers[rd] = decimalToBinary(
        //  binaryToDecimal(this.registers[rd], true) >> imm,
        //  16
        //);
        // ATTEMPT 2
        //const rd = binaryToDecimal(instruction[1], false);
        //const imm = binaryToDecimal(instruction[2], false);
        //const x=0
        //while (x != imm){
        //  this.registers[rd] = decimalToBinary(
        //    binaryToDecimal(this.registers[rd], true) >> 1,
        //    16
        //  );
        //  x++;
        //}
      }
      case "ORI": {
        // ORI rd, imm = rd = rd | imm
        //bit wise operation OR immediate
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], true);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) | imm,
          16
        );
        break;
      }
      case "ANDI": {
        // ANDI rd, imm = rd = rd & imm
        //bit wise operation AND immediate
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], true);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) & imm,
          16
        );
        break;
      }
      case "XORI": {
        // XORI rd, imm = rd = rd ^ imm
        //bit wise operation XOR immediate
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], true);
        this.registers[rd] = decimalToBinary(
          binaryToDecimal(this.registers[rd], true) ^ imm,
          16
        );
        break;
      }
      case "LI": {
        // LI rd, imm = rd = imm
        // Load immediate value into register
        const rd = binaryToDecimal(instruction[1], false);
        const imm = binaryToDecimal(instruction[2], true);
        this.registers[rd] = decimalToBinary(imm, 16);
        break;
      }
      case "J": {
        /// ASK why is this imm/2 instead of imm
        // J jump to address
        // J imm = PC = imm/2
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
        //attempt1
        //const input = prompt("Enter an integer: ");
        //this.registers[0] = decimalToBinary(parseInt(input || "0"), 16);
        break;
      case 3: // Print string
        // Implement print string logic here
        //atempt1
        //const str = this.registers[0]; 
        //console.log(str); // Assuming str is a string in the register
        break;
      case 4: // Read string
      //
      // Implement read string logic here
      //attempt1
      //const input = prompt("Enter a string: ");
      //this.registers[0] = decimalToBinary(parseInt(input || "0"), 16);
      case 10:
        this.halted = true; // Set halted to true to stop execution
        break;
    }
  }
}
