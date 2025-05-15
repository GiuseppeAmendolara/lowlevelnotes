# Prologue
This resource is free and open-source, built entirely on publicly available knowledge. For transparency and further reading, you can find our sources on the [references](/About/references) page.

Its purpose is to provide a structured learning path through the core principles of compiled programming languages, with a focus on both C# (.NET) and C++. While the examples draw from these two languages, many concepts apply broadly across modern compiled languages.

The guide follows a progressive, language-agnostic structure. Topics are introduced in a logical order to build a solid foundation before moving into more advanced material. Where useful, side-by-side comparisons are provided to highlight the similarities and differences between C# and C++.

!!! Warning
    This guide emphasizes depth and clarity. While it is beginner-friendly in tone, the structure may introduce complex ideas early on. If a topic feels overwhelming, take your time—pause, research, experiment, and revisit as needed. That’s how lasting understanding is built.

## Learning Structure: The Phasing System
To support structured learning, this resource is divided into progressive phases. Each phase builds on the previous one, guiding you from foundational knowledge to high-level programming concepts.

| Phase | Title | Focus Area |
|-|-|-|
| Phase I | Foundations | The absolute essential principles of programming. |
| Phase II | Core Competencies | Practical syntax, OOP, intermediate logic, and control structures. |
| Phase III | Advanced Concepts | Deeper topics like performance, language internals, and system-level code. |
| Phase IV | Code Design | Architecture, design patterns, security, and maintainable code design. |
| Phase V | Assembly | Low-Level: x86_64 assembly, memory layout, stack frames, calling conventions, etc. |

This phased approach supports a long-term understanding of programming, from high-level structure to the underlying mechanics of execution.

## Development flow

```mermaid
    graph TD;
    dp[Define the problem to solve]
    --> ds[Design a solution]
    --> wp[Write a program that implements the solution]
    --> b[Build the program]
    --> t[Test the program]
    -- DEBUG
    --> b
```    