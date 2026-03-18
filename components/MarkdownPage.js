const MarkdownPage = {
  data() {
    return {
      markdown: `
### C++
- [cppreference](https://en.cppreference.com/w/)
- [cplusplus reference](https://cplusplus.com/reference/)
- [W3Schools DSA Intro](https://www.w3schools.com/dsa/dsa_intro.php)
- [hackingcpp cheat sheets](https://hackingcpp.com/cpp/cheat_sheets.html)

### x86/x86_64
- [Godbolt Compiler Explorer](https://godbolt.org/)
- [MASM reference](https://learn.microsoft.com/en-us/cpp/assembler/masm/microsoft-macro-assembler-reference?view=msvc-170) for more information on x86 assembly in MASM32.
- [x86 and amd64 instruction reference](https://www.felixcloutier.com/x86/) for more information on x86 instructions.
- [Malwareunicorn's instruction searcher](https://malwareunicorn.org/x86)

### Design & Architecture
- [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)
- [Refactoring guru's Design Patterns](https://refactoring.guru/design-patterns)

### Windows Internals
- [Geoff Chappell](https://www.geoffchappell.com/index.htm?ta=5)
- [Alex Ionescu's ReactOS](https://doxygen.reactos.org/index.html)
- [NtDoc](https://ntdoc.m417z.com/)
- [Vergilius project](https://www.vergiliusproject.com/)
- [Programming reference for the Win32 API](https://learn.microsoft.com/en-us/windows/win32/api/)
- [mr.d0x's malapi list](https://malapi.io/)
- [pinvoke.net](https://www.pinvoke.net/)
- [Driver Verifier Tool](https://learn.microsoft.com/en-us/windows-hardware/drivers/devtest/driver-verifier)

### Reverse Engineering
- [Godbolt Compiler Explorer](https://godbolt.org/)
- [FLARE VM](https://github.com/mandiant/flare-vm)
- [REMnux](https://github.com/REMnux)
- [FLOSS](https://github.com/mandiant/flare-floss)
- [Reverse Engineering Resources-Beginners to intermediate Guide/Links](https://bbinfosec.medium.com/reverse-engineering-resources-beginners-to-intermediate-guide-links-f64c207505ed)
- [wtsxDev's list of reverse engineering resources](https://github.com/wtsxDev/reverse-engineering)

### CyberSecurity
- [TryHackMe](https://tryhackme.com/)
- [HackTheBox](https://www.hackthebox.com/)
- [A-Z Index of the Linux command line: bash + utilities](https://ss64.com/bash/)
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
