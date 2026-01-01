const { createApp } = Vue;

createApp({
  data() {
    return {
      siteName: "lowlevelnotes",
      tagline: "Structured notes on programming, low-level concepts, and system internals.",

      resources: [
        {
          title: "C-style C++",
          description: "Coming soon"
        },
        {
          title: "Introduction to assembly",
          description: "Coming soon"
        },
        {
          title: "C# Essentials",
          description: "Coming soon"
        },
        {
          title: "Java Essentials",
          description: "Coming soon"
        }
        ,
        {
          title: "Python Essentials",
          description: "Coming soon"
        }
        ,
        {
          title: "Linux Essentials",
          description: "Coming soon"
        }
        ,
        {
          title: "Itroduction to networks",
          description: "Coming soon"
        }
        ,
        {
          title: "Windows Internals",
          description: "Coming soon"
        }
      ],

      links: [
        {
          title: "Programming",
          description: "Language-agnostic foundations progressing into C#, C++, and assembly."
        },
        {
          title: "Windows Internals",
          description: "Processes, memory, PE format, syscalls, and the Windows API."
        },
        {
          title: "About",
          description: "Changelog, contribution guide, portfolio, and references."
        }
      ]
    };
  }
}).mount("#app")