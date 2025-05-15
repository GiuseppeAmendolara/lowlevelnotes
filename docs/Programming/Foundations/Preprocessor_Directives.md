# Preprocessor directives
Preprocessor directives are instructions that tell the compiler how to process the source code before actual compilation begins. They do not produce executable code but instead `control how the compiler treats parts of the code`.

Think of them as the control-flow of the compilation and not of the actual code.

| Directive                         | Description                                                          |
| --------------------------------- | -------------------------------------------------------------------- |
| `#define`                         | Defines a symbol (macro in C++).                                     |
| `#undef`                          | Undefines a previously defined symbol.                               |
| `#if`, `#elif`, `#else`, `#endif` | Conditionally includes/excludes code.                                |
| `#region`, `#endregion` (C# only) | Organizes code into collapsible sections in IDEs like Visual Studio. |
| `#error`                          | Forces a compilation error with a custom message.                    |
| `#warning`                        | Issues a compiler warning with a custom message. (C# only)           |
| `#pragma`                         | Sends special instructions to the compiler (e.g., disable warnings). |
| `#line`                           | Modifies line numbers for compiler/debugger.                         |

## Conceptual Differences

- C# Preprocessor Directives: Mostly for conditional compilation, regions, warnings, etc., integrated with Visual Studio tooling.
- C++ Preprocessor Directives: More low-level and powerful, often used for header guards, macros, platform-specific code, and more.

!!! example
    === "C++"
        ```cpp linenums="1"
        #include <iostream>

        #define DEBUG_MODE

        void Initialize()
        {
            std::cout << "Initializing..." << std::endl;
        }

        void Cleanup()
        {
            std::cout << "Cleaning up..." << std::endl;
        }

        int main()
        {
        #ifdef DEBUG_MODE
            std::cout << "Debug mode active" << std::endl;
        #endif

            Initialize();
            Cleanup();

            return 0;
        }
        ```

    === "C#"
        ```cs linenums="1"
        #define DEBUG

        class Program
        {
            #region Initialization
            static void Initialize()
            {
                Console.WriteLine("Initializing...");
            }
            #endregion

            #region Cleanup
            static void Cleanup()
            {
                Console.WriteLine("Cleaning up...");
            }
            #endregion

            static void Main()
            {
        #if DEBUG
                Console.WriteLine("Debug mode active");
        #endif
                Initialize();
                Cleanup();
            }
        }
        ```

## C/C++: Header Guards
C++ often uses preprocessor directives to avoid duplicate definitions across header files.

!!! example
    === "C++"
        ```cpp linenums="1"
        // MyHeader.h
        #ifndef MYHEADER_H
        #define MYHEADER_H

        void SayHello();

        #endif // MYHEADER_H
        ```

!!! note
    - \#region / #endregion is not supported in standard C++, it's a Visual Studio extension primarily for C#.
    - C++ uses #pragma more frequently for compiler-specific behavior (e.g., packing structs or disabling warnings).
    - \#error is useful in both C# and C++ for enforcing platform or configuration requirements.

