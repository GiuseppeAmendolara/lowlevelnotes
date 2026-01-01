# Operators
In programming, operators are special symbols or keywords that **perform operations** on values (called operands). These operations can range from arithmetic and logic to memory access and control flow. Operators are essential for creating expressions that calculate, compare, and manipulate data.

!!! note
    This sounds just like functions in programming, which we'll dive into the next lesson.

    That's because operators are functions.

## Categories

| Category                | Purpose                               | Example                          |
| ----------------------- | ------------------------------------- | -------------------------------- |
| **Arithmetic**          | Perform basic math                    | `+`, `-`, `*`, `/`, `%`          |
| **Assignment**          | Assign values                         | `=`, `+=`, `-=`, `*=`            |
| **Comparison**          | Compare two values (returns bool)     | `==`, `!=`, `<`, `>`, `<=`, `>=` |
| **Logical**             | Combine or negate boolean expressions | `&&`                             |
| **Bitwise**             | Perform bit-level operations          | `&`                              |
| **Increment/Decrement** | Increase or decrease a value by one   | `++`, `--`                       |
| **C/C++: Pointer/Dereference** | Work with memory addresses     | `&`, `*`                         |
| **Member access**       | Access object or struct members       | `.`, `->`                        |
| **Ternary**             | Compact conditional logic             | `? :`                            |
| **Type-related**        | Type casting or checking              | `static_cast`, `is`              |

## Arithmetic Operators
!!! example
    === "C#"
        ```csharp linenums="1"
        int a = 10, b = 3;
        int result = a * b + (a % b);
        ```

    === "x86_64 Assembly (NASM)"
        ```asm linenums="1"
        mov rax, 10
        add rax, 3      ; rax = rax + 3
        xor rdx, rdx    ; clear remainder
        mov rcx, 3
        div rcx         ; rax = quotient, rdx = remainder
        ```

## Assignment Operators
!!! example
    === "C++"
        ```cpp linenums="1"
        int x = 5;      // assign 5 to x
        x += 2;         // x = x + 2
        x *= 3;         // x = x * 3
        ```

## Comparison Operators
!!! example
    === "C++"
        ```cpp linenums="1"
        if (a == b)   // equal
        if (a != b)   // not equal
        if (a < b)    // less than
        ```

## Logical Operators
!!! example
    === "C++"
        ```cpp linenums="1"
        if (x > 0 && y > 0)   // AND
        if (x > 0 || y > 0)   // OR
        if (!done)           // NOT
        ```

## Bitwise Operators
Operate at the binary level. Often used in low-level code, hardware interaction, or performance-critical systems.

| Operator | Name        | Description                   |
| -------- | ----------- | ----------------------------- |
| `&`      | AND         | Both bits must be 1           |
| `|`      | OR          | Either bit is 1               |
| `^`      | XOR         | One bit is 1, not both        |
| `~`      | NOT         | Inverts bits (1's complement) |
| `<<`     | Shift Left  | Moves bits left               |
| `>>`     | Shift Right | Moves bits right              |

!!! example
    === "C++"
        ```cpp linenums="1"
        int a = 5; // 0101 int b = a << 1; // 1010 = 10
        ```

## Increment / Decrement
!!! example
    === "C++"
        ```cpp linenums="1"
        int a = 5;
        a++;   // now a is 6
        --a;   // now a is 5 again
        ```

!!! note
    Postfix (a++) vs Prefix (++a) can have different effects in expressions.

## C/C++: Pointer and Dereference
!!! example
    === "C++"
        ```cpp linenums="1"
        int val = 42;
        int* ptr = &val;  // address-of operator
        *ptr = 50;        // dereference, modifies val
        ```

## Ternary Operator
Compact alternative to an if-else.

!!! example
    === "C++"
        ```cpp linenums="1"
        int age = 20;
        string msg = (age >= 18) ? "Adult" : "Minor";
        ```

## Operator Precedence
Operators are evaluated in a specific order. Use parentheses () to control precedence.

!!! example
    === "C++"
        ```cpp linenums="1"
        int result = 2 + 3 * 4;  // result is 14, not 20
        int result = (2 + 3) * 4;  // now it's 20
        ```