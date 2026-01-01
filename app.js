const { createApp } = Vue;

createApp({
  data() {
    return {
      siteName: "lowlevelnotes",
      tagline: "Structured notes on programming, low-level concepts, and system internals.",

       people: [
        {
          name: "Grimy86",
          role: "Author & Maintainer",
          avatar: "https://avatars.githubusercontent.com/u/105457539?v=4",
          profile: "https://github.com/grimy86",
          external: false
        }
      ],

      resources: [
        {
          title: "C-style C++",
          author: "Grimy86",
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
    },
    getAuthor(name) {
      return this.people.find(p => p.name === name);
    }
  }
}).mount("#app");