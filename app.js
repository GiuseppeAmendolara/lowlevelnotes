const { createApp } = Vue;

createApp({
  data() {
    return {
      site: {
        name: "lowlevelnotes",
        url: "https://lowlevelnotes.com",
        description:
          "Structured notes on programming, low-level concepts, and system internals.",
        license: "MIT",
        repository: "https://github.com/grimy86/lowlevelnotes",
        version: "3.1.0",
        lastUpdated: "2026-1-1"
      },

      people: [
        {
          id: "grimy86",
          name: "Grimy86",
          role: "Author & Maintainer",
          avatar: "https://avatars.githubusercontent.com/u/105457539?v=4",
          profile: "https://github.com/grimy86",
          external: true,
          bio: "Low-level systems programmer focused on C++, assembly, and OS internals."
        }
      ],

      resources: [
        {
          id: "c-style-cpp",
          title: "C-style C++",
          authorId: "grimy86",
          description: "2024 Edition",
          pdf: "/resources/pdfs/c_style_cpp.pdf",

          level: "beginner",       // beginner | intermediate | advanced
          pages: 645,
          status: "published",     // published | draft
          featured: true,

          views: 0,
          createdAt: "2024-01-10",
          updatedAt: "2024-11-12"
        },

        {
          id: "csharp-essentials",
          title: "C# Essentials",
          description: "Coming soon", 
          level: "Beginner", 
          
          pages: 0,
          status: "draft",
          featured: true,

          views: 0
        },

        {
          id: "java-essentials",
          title: "Java Essentials",
          description: "Coming soon",
          level: "Beginner",

          pages: 0,
          status: "draft",
          featured: true,

          views: 0
        },

        {
          id: "python-essentials",
          title: "Python Essentials",
          description: "Coming soon",
          level: "Beginner",

          pages: 0,
          status: "draft",
          featured: true,

          views: 0
        },

        {
          id: "linux-essentials",
          title: "Linux Essentials",
          description: "Coming soon",
          level: "Beginner",

          pages: 0,
          status: "draft",
          featured: true,

          views: 0
        },
        
        {
          id: "intro-networks",
          title: "Introduction to networks",
          description: "Coming soon",
          level: "Beginner",

          pages: 0,
          status: "draft",
          featured: true,

          views: 0
        },

        {
          id: "intro-assembly",
          title: "Introduction to Assembly",
          description: "Coming soon",

          level: "intermediate",
          pages: 0,
          status: "draft",
          featured: true,

          views: 0
        },

        {
          id: "windows-internals",
          title: "Windows Internals",
          description: "Coming soon",

          level: "advanced",
          pages: 0,
          status: "draft",
          featured: true,

          views: 0
        }
      ]
    };
  },

  computed: {
    authorMap() {
      return Object.fromEntries(this.people.map(p => [p.id, p]));
    },

    publishedResources() {
      return this.resources.filter(r => r.status === "published");
    },

    draftResources() {
      return this.resources.filter(r => r.status === "draft");
    }
  },
  

  methods: {
    openResource(resource) {
      if (!resource.pdf) return;

      const key = `views:${resource.id}`;
      const count = Number(localStorage.getItem(key) || 0) + 1;
      localStorage.setItem(key, count);
      resource.views = count;

      window.open(resource.pdf, "_blank");
    }
  },

  mounted() {
    this.resources.forEach(r => {
      const stored = localStorage.getItem(`views:${r.id}`);
      if (stored) r.views = Number(stored);
    });
  }
}).mount("#app");