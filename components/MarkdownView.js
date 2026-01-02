const MarkdownView = {
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
- [JLearn PH's MASM32 assembly programming playlist](https://www.youtube.com/playlist?list=PLE6kld48wGGPEq1mDnFVfbLZ81gcP3nJj)
- [MASM reference](https://learn.microsoft.com/en-us/cpp/assembler/masm/microsoft-macro-assembler-reference?view=msvc-170) for more information on x86 assembly in MASM32.
- [x86 and amd64 instruction reference](https://www.felixcloutier.com/x86/) for more information on x86 instructions.
- [Malwareunicorn's instruction searcher](https://malwareunicorn.org/x86)
- [Tutorialspoint Nasm assembly](https://www.tutorialspoint.com/assembly_programming/index.htm)
- [Davy Wybiral's intro to x86 assembly language playlist](https://www.youtube.com/playlist?list=PLmxT2pVYo5LB5EzTPZGfFN0c2GDiSXgQe)
- [OliveStem's x86 assembly with NASM playlist](https://www.youtube.com/playlist?list=PL2EF13wm-hWCoj6tUBGUmrkJmH1972dBB)
- [ost2.fyi's Architecture 2001: x86-64 OS Internals](https://p.ost2.fyi/courses/course-v1:OpenSecurityTraining2+Arch2001_x86-64_OS_Internals+2021_v1/about)
- [asmtutor](https://asmtutor.com/)

### Design & Architecture
- [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)
- [Refactoring guru's Design Patterns](https://refactoring.guru/design-patterns)

### Windows Internals
- [Pavel Yosifovich's windows internals](https://scorpiosoftware.net/)
- [Pavel Yosifovich's youtube channel](https://www.youtube.com/@zodiacon)
- [0xRick's dive into PE file format](https://0xrick.github.io/)
- [Empyreal96's info depot](https://empyreal96.github.io/nt-info-depot/index.html)
- [Alex Ionescu's blog](https://www.alex-ionescu.com/)
- [Duncan Ogilvie's internals crash course](https://www.youtube.com/watch?v=I_nJltUokE0)
- [Alexander Sotirov's internals talk](https://www.youtube.com/watch?v=vz15OqiYYXo&t=194s)
- [Crow's malware development playlist](https://www.youtube.com/playlist?list=PL_z_ep2nxC57sHAlCcvvaYRrpdMIQXri1)
- [Red Team Notes on reversing, forensics & misc](https://www.ired.team/miscellaneous-reversing-forensics/windows-kernel-internals)
- [Rexir's Windows Internals Videos](https://www.youtube.com/playlist?list=PLt9cUwGw6CYF6Kj19mBZpfhQPsRIC5vGl)
- [TheSourceLens's Windows Internals part 1 playlist](https://www.youtube.com/playlist?list=PLhx7-txsG6t5i-kIZ_hwJSgZrnka4GXvn)
- [Nir Lichtman's diving into windows internals playlist](https://www.youtube.com/playlist?list=PL0tgH22U2S3G2QpiK-Q1wKW_Fe-Wiu7JS)
- [Geoff Chappell](https://www.geoffchappell.com/index.htm?ta=5)
- [Alex Ionescu's ReactOS](https://doxygen.reactos.org/index.html)
- [Programming reference for the Win32 API](https://learn.microsoft.com/en-us/windows/win32/api/)
- [ost2.fyi](https://p.ost2.fyi/courses)
- [mr.d0x's malapi list](https://malapi.io/)
- [pinvoke.net](https://www.pinvoke.net/)
- [Vergilius project](https://www.vergiliusproject.com/)
- [TechsavvyProductions](https://www.youtube.com/@TechsavvyProductions)
- [Driver Verifier Tool](https://learn.microsoft.com/en-us/windows-hardware/drivers/devtest/driver-verifier)

### Reverse Engineering
- [TryHackMe](https://tryhackme.com/)
- [jstrosch's learning reverse engineering repo](https://github.com/jstrosch/learning-reverse-engineering)
- [Dr Josh Stroschein - The Cyber Yeti youtube channel](https://www.youtube.com/@jstrosch/playlists)
- [Godbolt Compiler Explorer](https://godbolt.org/)
- [Programming reference for the Win32 API](https://learn.microsoft.com/en-us/windows/win32/api/)
- [FLARE VM](https://github.com/mandiant/flare-vm)
- [REMnux](https://github.com/REMnux)
- [FLOSS](https://github.com/mandiant/flare-floss)
- [Reverse Engineering Resources-Beginners to intermediate Guide/Links](https://bbinfosec.medium.com/reverse-engineering-resources-beginners-to-intermediate-guide-links-f64c207505ed)
- [ost2.fyi](https://p.ost2.fyi/courses)
- [0xZ0F's Reverse Engineering Course repo](https://github.com/0xZ0F/Z0FCourse_ReverseEngineering)
- [wtsxDev's list of reverse engineering resources](https://github.com/wtsxDev/reverse-engineering)
- [Malwareunicorn's workshops](https://malwareunicorn.org/#/workshops)

### Networks
- [IANA's Service Name and Transport Protocol Port Number Registry](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)
- [David Bombal Tech's CCNA course](https://www.youtube.com/playlist?list=PLw6kwOJVj3MbMZ8B72ZgUryj8OSETC0ds)
- [Jeremy's IT Lab CCNA course](https://www.youtube.com/playlist?list=PLxbwE86jKRgMpuZuLBivzlM8s2Dk5lXBQ)
- [NetworkChuck's CCNA course](https://www.youtube.com/playlist?list=PLIhvC56v63IJVXv0GJcl9vO5Z6znCVb1P)
- [Ryan Beney's CCNA course](https://www.youtube.com/playlist?list=PLARoRmMW-HhcvQKmukLEMZKEwjZKTT263)
- [Naj Qazi's CCNA course](https://www.youtube.com/playlist?list=PLFHOoRUI-sbQHs-iVdUTg492vuJEtU05-)

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
