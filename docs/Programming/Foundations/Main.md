# Entry Point (`main`)
When you run a program, something must happen first, that's our entry point. It's the very first function the operating system or runtime environment calls to kick off your code.

In most high-level compiled languages like C#, C++, or Rust, the entry point is a function called `main`. Some scripting languages like Python don't need a special function — code at the top level runs automatically.

Think of it as the front door of your application: when the operating system "enters" your program, it goes through main.


Why does it matter?

- It's the root of your program's execution tree.
- It's where you allocate memory, initialize subsystems, or call other functions.
- Every compiled binary or assembly must define this point clearly for the OS or runtime to find it.

!!! note
    Even in Assembly, there's still a "main", it's just not always called that.

## Anatomy of an Entry Point
The entry point `main` is a function, just like many others it has;

- A name (identifier)
- A return type
- (Possibility of using parameters)

However, main is special in the way that it doesn't NEED to return it's return type, which is unlike any other function in C++.

- `main()` is always looked for first by the runtime in C, C++, and C# (via metadata).
- The return value of `main()` tells the OS if the program ran successfully (0 means OK).
- In Assembly, we manually define a label (like `_start`) as the entry point, and call system calls directly.

=== "C++"
    ```cpp linenums="1"
    int main()
    {
        std::cout << "Hello from C++!" << std::endl;
        return 0;
    }
    ```

=== "C#"
    ```csharp linenums="1"
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello from C#!");
        }
    }
    ```

=== "x86_64 Assembly (NASM)"
    ```asm linenums="1"
    section .text
    global _start

    _start:
        ; write(1, message, length)
        mov rax, 1          ; syscall: write
        mov rdi, 1          ; fd: stdout
        mov rsi, message    ; pointer to message
        mov rdx, 14         ; message length
        syscall

        ; exit(0)
        mov rax, 60         ; syscall: exit
        xor rdi, rdi        ; status 0
        syscall

    section .data
    message db "Hello world!", 10
    ```

## Parameters
All versions of main can accept arguments passed by the operating system. These are usually the commandline arguments that we pass when starting a certain app. 

Think of it as using the commandprompt to open chrome in incognito mode and browse to google. Google and incognito are our arguments that we pass to chrome.exe's main function.

!!! example
    === "Commandline Arguments"
        ```linenums="1"
        chrome.exe --incognito https://www.google.com
        ```

    === "C / C++"
        ```cpp linenums="1"
        int main(int argc, char* argv[])
        {
            // argc = number of arguments
            // argv = array of C-style strings (char*)
        }
        ```

    === "C#"
        ```csharp linenums="1"
        static void Main(string[] args)
        {
            // args is a string array containing command-line arguments
        }
        ```

    === "Assembly"
        ```asm linenums="1"
        ; Arguments are pushed onto the stack or passed in registers
        ; (depends on OS ABI; Linux x86_64 uses RDI, RSI, RDX, etc.)
        ```