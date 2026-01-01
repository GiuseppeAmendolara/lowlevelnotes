# Expression-Bodied Members
Expression-bodied members are a `shorter way to write methods and properties` when they only have one line of code. Instead of `{ }`, you use `=>` (fat arrow).

Expression-Bodied `Lambda`:
```cs linenums="1"
(int x, int y) => x + y;
```

Expression-Bodied `Methods`:
When a method only returns a single value, you can `skip { } and return`.
```cs linenums="1"
public int Add(int x, int y) => x + y;
```

Expression-Bodied `Properties`:
Shortcut for `read-only properties` (only get, no set)
```cs linenums="1"
public int MyProperty => 42;  // Always returns 42
```

Expression-Bodied `Indexers`:
Used when a class acts like an array.
```cs linenums="1"
public int this[int index] => index * 2;
```

Expression-Bodied `Constructors`:
Short way to set a value in a constructor
```cs linenums="1"
public MyClass(string name) => Name = name;
```

Same as:
```cs linenums="1"
public MyClass(string name) 
{
    Name = name;
}
```