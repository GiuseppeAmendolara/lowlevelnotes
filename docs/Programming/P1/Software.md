# What is Software?
In contrast to hardware, the physical components of a computer, **software** refers to the applications and programs that run on that hardware. It's what allows us to interact with and make use of our computer systems.

At its core, software is simply a collection of instructions that tell the computer what to do. These instructions are processed by the CPU (Central Processing Unit). Writing these instructions is what we call programming or coding, and the written instructions are known as source code.

Most users interact with software by launching applications, typically .exe files on Windows. But where do these files come from?

## The translation process of compiled software
The complete process of converting source code into an executable program, comprising: preprocessing, compiling, assembling, and linking, is known as translation.

During this process, many high-level structures and comments are discarded or transformed. As a result, reverse-engineering binaries to retrieve the original source code is difficult and often incomplete. This highlights the importance of using version control systems and maintaining backups, as losing the original code may mean losing critical logic and documentation.

### Compiled languages
Source code written in compiled languages such as C and C++ is not executed directly. Instead, it undergoes a build process that transforms high-level code into a low-level binary format understandable by the CPU.

#### Preprocessing
Before compilation begins, each source file is scanned for preprocessing directives, commands that influence the way the code is compiled. This phase is handled by the preprocessor, which prepares the code for compilation by performing tasks such as:

- Removing comments
- Ensuring each file ends with a newline
- Expanding #include directives and macros (`#define`, `#ifdef`, etc.)

The preprocessor does not alter the original source files. Instead, it operates in memory or uses temporary files. The result of this step is called a translation unit, which is then passed to the compiler.

Historically, the preprocessor was a separate program from the compiler, but in modern
compilers, the preprocessor may be built right into the compiler itself.

#### Compilation
The compiler, which is a special piece of software, translates the high-level source code (C or C++) into assembly language. Performing the following tasks for each translation unit:

- Verifying the code against language rules. If any errors are found, the process halts and returns an error.
- Generating an intermediate representation in the form of assembly code (typically .s or .asm files).

#### Assembling
The generated assembly code is then processed by an assembler, which translates it into machine code, the raw binary instructions understood by the CPU. This machine code is stored in object files (e.g., .o or .obj).

At its core, a CPU only understands machine language, composed of binary digits (0s and 1s). However, writing directly in binary is extremely difficult due to:

- Poor readability
- Platform-specific instruction sets
- Inefficient development workflow

To address these limitations, assembly language was introduced. Assembly uses human-readable mnemonics that correspond directly to machine instructions.

!!! example
    === "Machine Language"
        ```
        1011000 0110001
        ```

    === "Assembly"
        ```asm
        mov al, 061h
        ```

    === "C++"
        ```cpp
        a = 97;
        ```


#### Linking object files and libraries
Once all source files are compiled and assembled into object files, they must be combined into a final executable by a program called the linker or loader.

The linker's responsibilities include:

- Validating object files
- Resolving cross-file dependencies (e.g., functions defined in one file and used in another)
- Linking library files, which are collections of precompiled code used for reuse

For example, C++ programs frequently link against the C++ Standard Library, which provides essential components like containers, streams, and algorithms.

The final product is typically a .exe (executable) or .dll (dynamic-link library) file. These binaries must follow specific formats defined by the target operating system (e.g., the Windows PE format) to be executed correctly.

### JIT-Compiled languages
C# is also a compiled language, but it follows a different model compared to C++. Instead of being compiled directly into machine code, C# is first compiled into Intermediate Language (IL), also known as Common Intermediate Language (CIL) or MSIL.

This IL code is platform-independent. It’s not executed directly by the operating system but instead by the .NET runtime, specifically the Common Language Runtime (CLR). The CLR performs Just-In-Time (JIT) compilation, converting IL to native machine code right before execution.

This hybrid approach offers several advantages:

- Portability: IL code can run on any platform with a compatible .NET runtime.
- Security and memory management: The CLR handles garbage collection, type safety, and more.
- Interoperability: Multiple .NET languages (like VB.NET, F#, etc.) can run together within the same runtime environment.

In short, C# is compiled ahead-of-time into an intermediate format, and interpreted or compiled just-in-time by the runtime when the application is launched. This places C# somewhere between compiled and interpreted languages, giving it both performance and flexibility.

### Interpreted languages
Languages that aren't compiled are interpreted or somewhere in-between. An interpreter is a program that is created to handle / directly execute the source code files of these languages without requiring them to be compiled first. Interpreters are usually more flexible but far less efficient, this also means that we have to have the interpreter installed because the OS alone won't be able to handle that language.

Think of this like your browser rendering this .html file or a simple .py script being executed by a program named python3.

!!! example
    === "Compiled"
        ```mermaid
            graph TD;

            hl[C++ Source Code Files]
            --> pp["Preprocessor: includes headers, macros (.ii/.i)"]
            pp --> comp["Compiler: generates Assembly (.s/.asm)"]
            comp --> asm["Assembler: generates Object Code (.o/.obj)"]
            asm --> link["Linker: links with Libraries (.lib/.a)"]
            link --> bin["Binary Executable (.exe/.dll)"]
            bin --> run[Running Program on Hardware]
        ```

    === "JIT-Compiled"
        ```mermaid
        graph TD;

        src[C# Source Code Files]
        --> csc["Preprocessor + Compiler (Roslyn): IL, CIL, MSIL Code (.dll/.exe)"]
        csc --> clr[".NET CLR + JIT Compilation: Native Code"]
        clr --> run[Running Program on Hardware]
        ```

    === "Interpreted"
        ```mermaid
        graph TD;
        
        js[JavaScript Source Code Files]
        --> int["Interpreted or JIT-Compiled by JavaScript Engine (e.g., V8)"]
        int --> run["Running in Browser / Hardware Execution"]
        ```

## The process of running software
When a binary (.exe) is executed, Windows creates a process for it. A process is an isolated environment that contains everything the program needs to function, including memory space, system resources, and one or more threads, units of execution that the CPU uses to run the program's instructions.

In summary, software is the bridge between human ideas and machine execution, made possible through the process of programming, compiling, and execution within an operating system.