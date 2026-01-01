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
        version: "4.1.0",
        lastUpdated: "2026-1-1"
      },

      currentPage: "home",

      nav: [
        { id: "home", label: "Home" },
        { id: "changelog", label: "Changelog" },
        { id: "contribute", label: "Contribute" }
      ],

      community: {
        discordServers: 4,
        collaborators: 1,
        communityTrust: "Strong",
        focusAreas: [
          "Game hacking",
          "Reverse engineering",
          "Low-level systems research"
        ]
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
        },

        {
          id: "csharp-essentials",
          title: "C# Essentials",
          description: "Coming soon", 
          level: "beginner", 
          
          pages: 0,
          status: "draft",
          featured: false,
        },

        {
          id: "java-essentials",
          title: "Java Essentials",
          description: "Coming soon",
          level: "beginner",

          pages: 0,
          status: "draft",
          featured: true,
        },

        {
          id: "python-essentials",
          title: "Python Essentials",
          description: "Coming soon",
          level: "beginner",

          pages: 0,
          status: "draft",
          featured: false,
        },

        {
          id: "linux-essentials",
          title: "Linux Essentials",
          description: "Coming soon",
          level: "beginner",

          pages: 0,
          status: "draft",
          featured: true,
        },
        
        {
          id: "intro-networks",
          title: "Introduction to networks",
          description: "Coming soon",
          level: "beginner",

          pages: 0,
          status: "draft",
          featured: true,
        },

        {
          id: "intro-assembly",
          title: "Introduction to Assembly",
          description: "Coming soon",

          level: "intermediate",
          pages: 0,
          status: "draft",
          featured: true,
        },

        {
          id: "windows-internals",
          title: "Windows Internals",
          description: "Coming soon",

          level: "advanced",
          pages: 0,
          status: "draft",
          featured: true,
        }
      ],

      changelog: [
      {
        version: "4.1.0",
        date: "2026-01-01",
        title: "Platform & Architecture Overhaul",
        changes: [
          "Acquired lowlevelnotes.com",
          "Switched from GitHub Pages to Vercel",
          "Migrated frontend to Vue.js",
          "Removed unmaintained content in preparation for PDF-based releases"
        ]
      },

      {
        version: "3.6.3",
        date: "2025-07-26",
        changes: [
          "Changed the logo to a pile of books",
          "Major site restructure",
          "Significant content reduction to improve maintainability",
          "Expanded portfolio section with an ImGui-based project"
        ]
      },

      {
        version: "3.6.2",
        date: "2025-07-01",
        changes: [
          "Expanded portfolio section with a Python & Docker project"
        ]
      },

      {
        version: "3.6.1",
        date: "2025-05-15",
        changes: [
          "Restructured programming section while preserving standalone guides",
          "Added Phase I sections: Operators, Functions, Control Flow, Preprocessor directives, Mesologue",
          "Updated Prologue and Phase I: Data Types"
        ]
      },

      {
        version: "3.6.0",
        date: "2025-05-12",
        changes: [
          "Restructured programming section while preserving standalone guides",
          "Added Phase I: Data Types, Null and void",
          "Added Phase I: Program entry point",
          "Updated Phase I: Memory"
        ]
      },

      {
        version: "3.5.5",
        date: "2025-05-02",
        changes: [
          "Updated Windows Internals section: DLLs"
        ]
      },

      {
        version: "3.5.4",
        date: "2025-04-22",
        changes: [
          "Added Phase I: IDEs & build configurations",
          "Added Phase I: Memory",
          "Added Phase I: Statements",
          "Temporarily removed Reverse Engineering content",
          "Temporarily removed Networks & CyberSecurity content"
        ]
      },

      {
        version: "3.5.3",
        date: "2025-04-21",
        changes: [
          "Updated About Me page",
          "Updated Portfolio page",
          "Started unified programming guide",
          "Introduced phasing model",
          "Added Phase I: Introduction",
          "Added Phase I: Software"
        ]
      },

      {
        version: "3.5.2",
        date: "2025-04-08",
        changes: [
          "Added References section"
        ]
      },

      {
        version: "3.5.1",
        date: "2025-04-07",
        changes: [
          "Added Contribution & Style guide",
          "Added profile picture to About Me",
          "Added Changelog"
        ]
      },

      {
        version: "3.5.0",
        date: "2025-04-02",
        changes: [
          "Migrated site to MkDocs Material"
        ]
      },

      {
        version: "2.5.0",
        date: "2025-03-26",
        changes: [
          "Started hosting unified repository on GitHub Pages using Jekyll (Just the Docs)"
        ]
      },

      {
        version: "1.5.0",
        date: "2025-03-23",
        changes: [
          "Added Windows Internals summary (unfinished)"
        ]
      },

      {
        version: "1.4.0",
        date: "2025-02-11",
        changes: [
          "Added Reverse Engineering summary (unfinished)"
        ]
      },

      {
        version: "1.3.0",
        date: "2025-01-25",
        changes: [
          "Added CyberSecurity summary (unfinished)"
        ]
      },

      {
        version: "1.2.0",
        date: "2025-01-07",
        changes: [
          "Unified C++, C#, and x86 Assembly notes into the CCI25 repository"
        ]
      },

      {
        version: "0.3.0",
        date: "2024-10-01",
        changes: [
          "Released C# notes"
        ]
      },

      {
        version: "0.2.0",
        date: "2024-09-01",
        changes: [
          "Released x86 Assembly notes (NASM & MASM)"
        ]
      },

      {
        version: "0.1.0",
        date: "2024-08-01",
        changes: [
          "Released LearnCpp C-style / C++ notes"
        ]
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
    },

    featuredResources() {
      return this.resources.filter(r => r.featured);
    },

    navIndex() {
      return this.nav.findIndex(n => n.id === this.currentPage);
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
}).mount("#app");