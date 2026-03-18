# Functions / Methods
A `function` is a block of code that will run whenever we call it, think of our `Main` function. 

!!! example
    === "C++"
        ```cpp linenums="1"
        int main()
        {
            return 0;
        }
        ```

We usually use functions / methods to make our code easier to read, organized, reusable, etc.

In object-oriented programming, a method is simply a function that belongs to a class or object.

In C#, every function is technically a method, because all code must reside in a class.

## Anatomy of a Function / Method

| Component       | Description                                       | Example           |
|----------------|---------------------------------------------------|-------------------|
| Return Type     | Data type returned after execution               | `int`, `void`     |
| Name            | Identifier used to call the function             | `Add`, `PrintLine`|
| Parameters      | Input values used inside the function            | `(int a, int b)`  |
| Body            | Block of statements executed when called         | `{ return a + b; }`|

!!! example
    === "C++"
        ```cpp linenums="1"
        int Add(int a, int b) 
        {
            return a + b; // Returns the sum of a and b as an integer type
        }

        void PrintLine(std::string sentence) 
        {
            std::cout << sentence << std::endl; // Prints the provided sentence to the console
        }

        void PrintLine() 
        {
            std::cout << "I got passed 0 arguments." << std::endl; // No parameters
        }
        ```

    === "C#"
        ```cs linenums="1"
        int Add(int a, int b) 
        {
            return a + b; // Returns the sum of a and b as an integer type
        }

        void PrintLine(string sentence)
        {
            Console.WriteLine(sentence); // Prints the provided sentence to the console
        }

        void PrintLine() 
        {
            Console.WriteLine("I got passed 0 arguments."); // No parameters
        }
        ```

!!! note
    You might notice we have two `PrintLine()` functions.

    This is called **function overloading**—multiple functions can share the same name if their parameter lists or functions signature differs.

`Calling` these functions would look something like this:

!!! example
    === "C++"
        ```cpp linenums="1"
        // When we call functions we pass arguments for the asked parameters.
        int a = Add(5, 5);
        PrintLine("int a is equal to: " + std::to_string(a));
        PrintLine();
        ```

    === "C#"
        ```cs linenums="1"
        // When we call functions we pass arguments for the asked parameters.
        int a = Add(5, 5);
        PrintLine("int a is equal to: " + a);
        PrintLine();
        ```