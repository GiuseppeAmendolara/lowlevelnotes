# Contribution & Style guide
## GitHub Contribution Workflow
Contribution can be done by following these steps:

1. Fork the repository to create your own copy.
2. Create a new branch to make your changes (preferably with a descriptive name).
3. Make your changes—whether it's bug fixes, new features, or documentation updates.
4. Commit your changes with a clear and concise commit message.
5. Push your changes to the appropriate branch in your fork.
6. Create a pull request from your branch to the `main` branch of this repository.

For more detailed information on contributing to a project on GitHub, please refer to the official [GitHub Contribution Guide](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project).

## Style guide
This project is statically generated using [MkDocs-Material](https://squidfunk.github.io/mkdocs-material/reference/), which uses a specific Markdown format. Please keep the following in mind when contributing:

- Ensure that any code samples use proper Markdown syntax highlighting. Use `linenums="1"` for better readability of the code.
- For optimal rendering, make sure your Markdown files follow the correct structure and formatting. You can test the website locally by following the [MkDocs-Material Installation Guide](https://squidfunk.github.io/mkdocs-material/getting-started/).

!!! example
    === "C#"

        ```cs title="main.cs" linenums="1"
        using System;

        namespace ConsoleProject
        {
            class Program
            {
                static void Main(string[] args)
                {
                    Console.WriteLine("Hello world!");
                }
            }
        }
        ```

    === "C++"

        ```cpp title="main.cpp" linenums="1"
        #include <iostream>

        int main()
        {
            std::cout << "Hello world!" << std::endl;
            return 0;
        }
        ```

## Pull Request Guidelines
To ensure a smooth review process, please adhere to the following guidelines when submitting a pull request:

- Provide a **clear, detailed description of the changes** you’ve made, including the motivation behind them and any relevant context. Without a sufficient description, your pull request may be ignored or closed without review.
- Follow the **correct formatting** guidelines. Pull requests with improper formatting may be asked to be revised until they render correctly.

!!! warning
    Pull requests **lacking** a detailed description or proper formatting may be **rejected**. We encourage you to write well-documented, easy-to-read code to streamline the review process.

    By following these guidelines, you'll help maintain the quality and consistency of the project and make it easier for maintainers to review and merge your contributions.