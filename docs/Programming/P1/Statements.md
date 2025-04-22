# Statements
At its core, a computer program is a sequence of instructions that are executed from top to bottom, one after the other. This sequential nature is essential to understanding how a program operates.

In both everyday language and programming, a statement is something that expresses an action or intent. In programming, a statement is an instruction that tells the computer to perform a specific task.

In C++ (and C#), statements are the most common type of instruction. They are the smallest independent units of execution, much like sentences in a spoken language. Most statements in C++ end with a semicolon (;), which marks the end of the instruction.

In high-level languages such as C++, a single statement can translate into multiple low-level machine instructions after compilation.

!!! example
    === "C++"
        ```cpp
        int a = 99;
        ```

    === "Assembly"
        ```asm
        mov dword ptr [a],63h 
        ```

    === "Hex representation"
        ```
        C7 45 F8 63 00 00 00
        ```

    === "Machine code"
        ```
        1100 0111 0100 0101 1111 1000 0110 0011 0000 0000 0000 0000 0000 0000
        ```

Different kinds of statements:

There are several types of statements in C++:

- Declaration statements: Introduce variables (e.g., int x;)
- Expression statements: Perform calculations or function calls (e.g., x = x + 1;)
- Jump statements: Alter the flow of execution (e.g., return, break, continue)
- Compound statements: Group multiple statements using {} braces
- Selection statements: Make decisions (e.g., if, switch)
- Iteration statements: Create loops (e.g., for, while)
- Exception-handling statements: Manage errors (e.g., try, catch)