# Tuples
A data structure that contains a sequence of elements of different data types. A tuple can have elements from 1 to 8 types. If try to add elements greater than eight, then the compiler will throw an error. 

```cs linenums="1"
Tuple<int, string, string> person = new Tuple()<int, string, string>(1, "Steve", "Jobs");
```

There are many ways to use tuples:
```cs linenums="1"
public (string, int) GetStringAndInt()
{
    string resultString = "Hello";
    int resultInt = 42;
    return (resultString, resultInt);
}
```
```cs linenums="1"
(int Id, string FirstName, string LastName) person = (1, "Bill", "Gates");
person.Id;   // returns 1
person.FirstName;  // returns "Bill"
person.LastName; // returns "Gates"
```