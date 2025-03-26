---
layout: page
title: 4. Assembly Architecture
parent: Programming Foundations
---

Note this guide was reworked from x86 to x86-64 for really exact and specific differences you should do your own research.

**prerequisites:** [C++](/readme.md#c-style-c)

## Architecture
1. [Intro](/Programming_Foundations/Assembly/Architecture/Intro.md)
2. [x86 Architecture](/Programming_Foundations/Assembly/Architecture/Architecture.md)
3. [Modes of operation](/Programming_Foundations/Assembly/Architecture/Operating_Modes.md)
4. [Memory](/Programming_Foundations/Assembly/Architecture/Memory.md)
5. [CPU Registers](/Programming_Foundations/Assembly/Architecture/CPU_Registers.md)
6. [E Flags](/Programming_Foundations/Assembly/Architecture/E_Flags.md)
7. [Word Sizes](/Programming_Foundations/Assembly/Architecture/Sizes.md)
8. [The Stack](/Programming_Foundations/Assembly/Architecture/Call_Stack.md)
9. [Calling Conventions](/Programming_Foundations/Assembly/Architecture/Calling_Conventions.md)
10. [Instructions / Opcodes](/Programming_Foundations/Assembly/Architecture/Instructions.md)

## Syntax
1. [Directives](/Programming_Foundations/Assembly/Architecture/Directives.md)
2. [Instructions](/Programming_Foundations/Assembly/Architecture/Instructions.md)
3. [Radix characters](/Programming_Foundations/Assembly/Architecture/Radix_Chars.md)
4. [Character constants](/Programming_Foundations/Assembly/Architecture/Character_Constants.md)
5. [Reserved words](/Programming_Foundations/Assembly/Architecture/Reserved_words.md)
6. [Identifiers](/Programming_Foundations/Assembly/Architecture/Identifiers.md)
7. [Declaring variables](/Programming_Foundations/Assembly/Architecture/Declaring_Variables.md)
8. [Operator precedence](/Programming_Foundations/Assembly/Architecture/Operator_Presedence.md)

## Example programs
- [Example masm program](/Programming_Foundations/Assembly/Examples/hello_world.asm)
- [Example nasm program](/Programming_Foundations/Assembly/Examples/hello_world_nasm.asm)

{: .warning }
> To compile NASM on windows download [NASM](https://www.nasm.us/) & [w64devkit-x86](https://github.com/skeeto/w64devkit/releases/tag/v2.0.0).
> 
> Use NASM to assemble the .asm file into an object file (.obj). Run this command in the same directory where the .asm file is located:
> ```nasm -f win32 -o fileName.obj fileName.asm```
>
> Use GCC to link the .obj file and create the final executable (.exe). Run this command:
> ```gcc -mconsole -nostartfiles -o fileName.exe fileName.obj```