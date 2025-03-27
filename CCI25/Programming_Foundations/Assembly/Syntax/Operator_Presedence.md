---
layout: page
title: 6. Operator Presedence
permalink: /Programming_Foundations/Assembly/Syntax/Operator_Presedence
parent: Syntax
nav_order: 5
---

# Operator presedence

| Operator    | Presedence level    | Description               | Example          |
|-------------|---------------------|---------------------------|------------------|
| [ ]         | 1                   | Memory Access             | MOV EAX, [EBX]   |
| *           | 2                   | Scaling factor            | MOV EAX, [ECX*4] |
| +,-         | 3                   | Address calcultation      | MOV EAX, [EBX + ECX] |