---
layout: page
title: 1. Operator Overloading
permalink: /Programming_Foundations/CSharp/Intermediate/Operator_Overloading
parent: Intermediate
nav_order: 0
---

# Operator Overloading
You can redefine or overload most of the built-in operators available in C#. Thus a programmer can use operators with user-defined types as well. Overloaded operators are functions with special names the keyword ``operator``.

Basically, you are specifying how a operator should "calculate" or manipulate the data of a certain object.
```cs
public static Box operator+ (Box b, Box c)
{
   Box box = new Box();
   box.length = b.length + c.length;
   box.breadth = b.breadth + c.breadth;
   box.height = b.height + c.height;
   return box;
}
```