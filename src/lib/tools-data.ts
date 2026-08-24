export type ToolLink = { name: string; url: string }
export type ToolGroup = { label?: string; links: ToolLink[] }
export type ToolCategory = { title: string; groups: ToolGroup[] }

export const toolCategories: ToolCategory[] = [
  {
    title: 'Core Exploration Tools',
    groups: [
      {
        links: [
          { name: 'Godbolt Compiler Explorer', url: 'https://godbolt.org' },
          { name: 'Malwareunicorn Instruction Search', url: 'https://malwareunicorn.org' },
        ],
      },
    ],
  },
  {
    title: 'Malware Analysis Environment',
    groups: [
      {
        links: [
          { name: 'FLARE VM', url: 'https://github.com/mandiant/flare-vm' },
          { name: 'REMnux', url: 'https://remnux.org' },
          { name: 'FLOSS (Obfuscated String Solver)', url: 'https://github.com/mandiant/flare-floss' },
        ],
      },
    ],
  },
  {
    title: 'Low-Level & Reverse Engineering References',
    groups: [
      {
        label: 'Assembly (x86 / x64)',
        links: [
          { name: 'x86 / amd64 Instruction Reference', url: 'https://www.felixcloutier.com/x86/' },
          { name: 'MASM Reference', url: 'https://learn.microsoft.com/en-us/cpp/assembler/masm/' },
        ],
      },
      {
        label: 'Windows Internals',
        links: [
          { name: 'Win32 API Reference', url: 'https://learn.microsoft.com/en-us/windows/win32/api/' },
          { name: 'NtDoc', url: 'https://ntdoc.m417z.com' },
          { name: 'Vergilius Project', url: 'https://vergiliusproject.com' },
          { name: 'ReactOS (Source + Docs)', url: 'https://reactos.org' },
          { name: 'Geoff Chappell', url: 'https://www.geoffchappell.com' },
          { name: 'malapi', url: 'https://malapi.io' },
          { name: 'pinvoke.net', url: 'https://pinvoke.net' },
          { name: 'Driver Verifier Tool', url: 'https://learn.microsoft.com/en-us/windows-hardware/drivers/devtest/driver-verifier' },
        ],
      },
    ],
  },
  {
    title: 'Programming References',
    groups: [
      {
        label: 'C++',
        links: [
          { name: 'cppreference', url: 'https://cppreference.com' },
          { name: 'cplusplus.com', url: 'https://cplusplus.com' },
          { name: 'hackingcpp Cheat Sheets', url: 'https://hackingcpp.com' },
        ],
      },
      {
        label: 'Linux / Bash',
        links: [{ name: 'SS64 Bash Reference', url: 'https://ss64.com/bash/' }],
      },
      {
        label: 'Web Utilities',
        links: [{ name: 'Emmet Abbreviations', url: 'https://docs.emmet.io' }],
      },
    ],
  },
  {
    title: 'Software Design & Architecture',
    groups: [
      {
        links: [
          { name: 'Design Patterns (GoF Book)', url: 'https://en.wikipedia.org/wiki/Design_Patterns' },
          { name: 'Refactoring Guru', url: 'https://refactoring.guru' },
        ],
      },
    ],
  },
  {
    title: 'Practice Platforms',
    groups: [
      {
        label: 'Reverse Engineering',
        links: [
          { name: 'Reverse Engineering Guide', url: 'https://github.com/wtsxDev/reverse-engineering' },
          { name: 'WtsxDev RE List', url: 'https://github.com/wtsxDev/reverse-engineering' },
        ],
      },
      {
        label: 'Cybersecurity',
        links: [
          { name: 'TryHackMe', url: 'https://tryhackme.com' },
          { name: 'HackTheBox', url: 'https://hackthebox.com' },
          { name: 'CVE Details', url: 'https://cvedetails.com' },
        ],
      },
      {
        label: 'Computer Science Fundamentals',
        links: [
          { name: 'W3Schools DSA', url: 'https://w3schools.com/dsa/' },
          { name: 'OSSU Computer Science', url: 'https://github.com/ossu/computer-science' },
          { name: 'Time Complexity Calculator', url: 'https://www.google.com/search?q=time+complexity+calculator' },
        ],
      },
    ],
  },
]