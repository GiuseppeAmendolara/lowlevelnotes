# Data Types, Variables, LValues and RValues.

Every programming language deals with "data", which is a BIG word. It could be any sort of representation of an object, any number, any letter or even be a complex structures (collection of different data).

## What is a data type?
Before data can be used, it must be categorized. These data types define how data is stored in memory, what operations can be performed on it, and how much space it occupies. A **data type** tells the compiler or interpreter what kind of value a variable holds. It also defines:

- The size of the data in memory
- The operations that can be performed on it
- The format in which the value is interpreted

Different languages support different sets of types, but most programming languages classify data into the following major categories:

- **Integers**: Whole numbers (e.g., 0, -7, 42)
- **Floating-point numbers**: Decimal numbers (e.g., 3.14, -0.01)
- **Characters**: Single characters (e.g., 'A', 'z')
- **Booleans**: Logical values (`true` / `false`, or `1` / `0`)
- **Pointers/References**: Memory addresses of other variables
- **Custom / Composite types**: `struct`, `class`, arrays, etc.

!!! note
    Essentially, these types of categories don't even exist, it's just a way for us to talk about them and tell the compiler how to use it. In the end it's all bits and bytes and the size is the only real difference.

!!! example
    === "C / C++"
        ```cpp  linenums="1"
        int age = 25;
        float pi = 3.14f;
        char letter = 'A';
        bool isReady = true;
        int* ptr = &age;
        ```

    === "C#"
        ```csharp linenums="1"
        int age = 25;
        float pi = 3.14f;
        char letter = 'A';
        bool isReady = true;
        int[] numbers = new int[5];
        ```

    === "x86_64 Assembly (NASM)"
        ```asm linenums="1"
        section .data
        age db 25              ; 8-bit integer
        pi dd 0x4048F5C3       ; 32-bit float in IEEE-754
        letter db 'A'          ; Character as byte
        ```

## LValues and RValues
In C++ (and many other languages), every expression is either an **LValue** or an **RValue**.

An **LValue** (short for locator value) refers to an object that occupies a specific location in memory. It's often found on the left-hand side of an assignment, but that's not a strict requirement.

An **RValue** (short for read value) is a temporary value that does not have a persistent memory address. It typically appears on the right-hand side of an assignment.

!!! note
    LValues are **not limited** to the left side of assignments.
    They can appear on either side of an expression.
    The key distinction is whether the expression has a persistent addressable memory location.

!!! example
    === "C++"
    | Expression       | LValue or RValue | Why?                                    |
    | ---------------- | ---------------- | --------------------------------------- |
    | `int a = 10;`    | `a` = LValue     | It refers to a named object in memory   |
    | `a = 20;`        | `20` = RValue    | It's a temporary literal                |
    | `int b = a + 5;` | `a + 5` = RValue | It's a computed temporary value         |
    | `&a`             | LValue           | You can take its address                |
    | `&(a + 5)`       | ERROR            | You can't take the address of an RValue |

## NULL and nullptr
In lower-level languages like C and C++, it's common to work directly with memory. When a pointer doesn't point to any valid location, it's typically assigned a special value:

- In **C**: `NULL`
- In **C++11 and beyond**: `nullptr` (more type-safe)

These represent an **invalid or empty pointer**, and trying to dereference them (i.e., access what they point to) causes runtime errors like segmentation faults.

!!! example
    === "C"
        ```c linenums="1"
        int* ptr = NULL;
        if (ptr == NULL)
        {
            // Handle the null pointer
        }
        ```

    === "C++"
        ```cpp linenums="1"
        int* ptr = nullptr;
        ```

    === "C#"
        ```csharp linenums="1"
        string name = null;
        if (name == null)
        {
            // Null reference check
        }
        ```

    === "Assembly (x86_64)"
        ```asm linenums="1"
        xor rax, rax        ; Set RAX to 0 (null equivalent)
        mov [ptr], rax      ; Store null into variable
        ```

## The `void` type

The `void` type is a **special keyword** used to indicate:

- A function **returns no value**
- A **generic pointer** in C/C++ (`void*`)
- **No meaningful type**

It plays an important role in both function signatures and memory manipulation.

!!! example
    === "C / C++"
        ```c linenums="1"
        void Foo()
        {
            printf("Hello, World!\n");
        }

        void* mem = malloc(100);  // void pointer
        ```

    === "C#"
        ```csharp linenums="1"
        void Foo()
        {
            Console.WriteLine("Hello, World!");
        }
        ```

    === "Assembly (x86_64)"
        Assembly doesn't have a native concept of `void`, but lack of return is implied when no value is moved into a return register like `rax`.

---

## Static typing vs Dynamic typing

- Statically typed languages (e.g., C, C++, C#) require data types to be declared at compile time.
- Dynamically typed languages (e.g., Python, JavaScript) infer types at runtime.

!!! example
    === "C++ (Static)"
        ```cpp linenums="1"
        int score = 100;  // Must be declared with a type
        ```

    === "Python (Dynamic)"
        ```python linenums="1"
        score = 100  # Type inferred at runtime
        ```

Static typing helps catch errors early and allows for optimization, while dynamic typing offers flexibility and faster prototyping.

## Summary

- **Data types** are essential for efficient memory usage, correctness, and program clarity.
- `NULL` and `nullptr` means "empty" and helps prevent invalid memory access by marking "empty" or uninitialized memory.
- `void` signifies no return or an untyped pointer.
- Understanding how types work across languages helps you move between low-level and high-level programming more confidently.