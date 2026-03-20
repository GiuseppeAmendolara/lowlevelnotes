const MarkdownPage = {
  data() {
    return {
      markdown: `
## Core Exploration Tools
- [Godbolt Compiler Explorer](https://godbolt.org/)
- [Malwareunicorn Instruction Search](https://malwareunicorn.org/x86)

<br>

---

<br>

## Malware Analysis Environment
- [FLARE VM](https://github.com/mandiant/flare-vm)
- [REMnux](https://github.com/REMnux)
- [FLOSS (Obfuscated String Solver)](https://github.com/mandiant/flare-floss)

<br>

---

<br>

## Low-Level & Reverse Engineering References
### Assembly (x86 / x64)
- [x86 / amd64 Instruction Reference](https://www.felixcloutier.com/x86/)
- [MASM Reference](https://learn.microsoft.com/en-us/cpp/assembler/masm/microsoft-macro-assembler-reference?view=msvc-170)

### Windows Internals
- [Win32 API Reference](https://learn.microsoft.com/en-us/windows/win32/api/)
- [NtDoc](https://ntdoc.m417z.com/)
- [Vergilius Project](https://www.vergiliusproject.com/)
- [ReactOS (Source + Docs)](https://doxygen.reactos.org/index.html)
- [Geoff Chappell](https://www.geoffchappell.com/index.htm?ta=5)
- [malapi](https://malapi.io/)
- [pinvoke.net](https://www.pinvoke.net/)
- [Driver Verifier Tool](https://learn.microsoft.com/en-us/windows-hardware/drivers/devtest/driver-verifier)

<br>

---

<br>

## Programming References
### C++
- [cppreference](https://en.cppreference.com/w/)
- [cplusplus.com](https://cplusplus.com/reference/)
- [hackingcpp Cheat Sheets](https://hackingcpp.com/cpp/cheat_sheets.html)

### Linux / Bash
- [SS64 Bash Reference](https://ss64.com/bash/)

### Web Utilities
- [Emmet Abbreviations](https://docs.emmet.io/abbreviations/)

<br>

---

<br>

## Software Design & Architecture
- [Design Patterns (GoF Book)](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)
- [Refactoring Guru](https://refactoring.guru/design-patterns)

<br>

---

<br>

## Practice Platforms
### Reverse Engineering
- [Reverse Engineering Guide](https://bbinfosec.medium.com/reverse-engineering-resources-beginners-to-intermediate-guide-links-f64c207505ed)
- [WtsxDev RE List](https://github.com/wtsxDev/reverse-engineering)

### Cybersecurity
- [TryHackMe](https://tryhackme.com/)
- [HackTheBox](https://www.hackthebox.com/)
- [CVE Details](https://www.cvedetails.com/)

### Computer Science Fundamentals
- [W3Schools DSA](https://www.w3schools.com/dsa/dsa_intro.php)
- [OSSU Computer Science](https://github.com/ossu/computer-science)
- [Time Complexity Calculator](https://www.timecomplexity.ai/)
      `,
    };
  },

  computed: {
    html() {
      return marked.parse(this.markdown);
    },
  },

  template: `
    <div class="markdown" v-html="html"></div>
  `,
};