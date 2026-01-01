# Configuration
## Development Environment
An IDE (Integrated Development Environment) is a software application that provides comprehensive facilities for software development. It typically includes:

- A code editor for writing source files
- Tools for building/compiling the code
- A debugger for identifying and fixing errors

While it's possible to use a simple text editor and compile manually, this approach requires significant setup and experience, and is not ideal for most learners.

Examples of IDEs:

- Visual Studio Community 2022 (recommended)
- Geany
- Code::Blocks
- Eclipse

## Build configurations
A build configuration (or build target) defines how a project is built, including settings such as the output file name, compiler optimization level, debugging information, and library paths. Most IDEs provide at least two configurations by default:

### Debug configuration
- Used during development
- Disables optimizations for easier debugging
- Includes detailed debugging information
- Typically slower and larger

### Release configuration
- Intended for final production builds
- Enables full compiler optimizations
- Omits debugging information
- Results in faster, smaller executables

## Compiler extensions
Some compilers support extensions that go beyond the C++ standard, either for compatibility or historical reasons. Using these can lead to non-portable and non-standard code. It is recommended to disable compiler extensions to ensure conformance to the official C++ standard. In Visual Studio, this setting is called Conformance Mode and should be set to "Yes (/permissive-)".

## Compiler Diagnostics
The compiler checks code for compliance with the C++ standard and provides diagnostics when issues are found.

### Errors
Errors indicate violations that prevent compilation. They are accompanied by messages specifying the file and line number.

- Indicate rule violations that prevent compilation
- Include a message and source location
- Must be fixed before the program can compile

### Warnings
Warnings indicate potential issues that do not stop compilation. While not technically errors, they often highlight poor or risky code.

- Highlight potential issues that may not stop compilation
- Often signal risky or unintended behavior
- Should be addressed as best practice

Recommendations:

- Resolve warnings promptly.
- Increase warning levels for stricter checks.
- Enable “Treat warnings as errors” to enforce good coding habits.

## Language Standard Selection
C++ evolves through standardized versions (e.g., C++11, C++17, C++20). Compilers typically default to older standards, such as C++14.

Recommendations:

- For learning or personal projects, use the latest finalized standard.
- For production environments, prefer a standard one or two versions behind to ensure compiler stability and broad support.

The same principles apply to C#, select appropriate language versions, avoid non-standard features, and handle warnings rigorously.