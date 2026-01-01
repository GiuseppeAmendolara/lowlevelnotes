const { createApp } = Vue;

createApp({
  data() {
    return {
      siteName: "lowlevelnotes",
      tagline: "Structured notes on programming, low-level concepts, and system internals.",

      resources: [
        {
          title: "C-style C++",
          description: "2024 Edition",
          pdf: "/resources/pdfs/c_style_cpp.pdf"
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
        },
        {
          title: "Python Essentials",
          description: "Coming soon"
        },
        {
          title: "Linux Essentials",
          description: "Coming soon"
        },
        {
          title: "Introduction to networks",
          description: "Coming soon"
        },
        {
          title: "Windows Internals",
          description: "Coming soon"
        }
      ]
    };
  },

  methods: {
    openResource(resource) {
      if (!resource.pdf) return;
      window.open(resource.pdf, "_blank");
    }
  }
}).mount("#app");