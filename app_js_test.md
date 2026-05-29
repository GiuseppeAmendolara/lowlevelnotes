const { createApp } = Vue;
const API_BASE = "https://api.lowlevelnotes.com";

// 🔒 Disable right-click
document.addEventListener("contextmenu", (e) => e.preventDefault());

// 🔒 Disable devtools shortcuts & view source
document.addEventListener("keydown", (e) => {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
    (e.ctrlKey && e.key === "U")
  ) {
    e.preventDefault();
  }
});

// 🔒 Disable copy (overrides clipboard with a protection notice)
document.addEventListener("copy", (e) => {
  e.preventDefault();
  e.clipboardData.setData("text/plain", "Content is protected.");
});

// 🔒 Disable drag (prevents dragging images/text out)
document.addEventListener("dragstart", (e) => e.preventDefault());

createApp({
  components: { MarkdownPage },
  data() {
    return {
      loading: true,
      maintenance: false,
      site: {
        name: "lowlevelnotes",
        url: "https://lowlevelnotes.com",
        description: "Organized knowledge for mastering software development.",
        license: "MIT License",
        repository: "https://github.com/grimy86/lowlevelnotes",
        free: "Free learning resources.",
        openSource: "Open source.",
        privacy: "Full privacy.",
        ads: "Zero ads.",
      },
      currentPage: "resources",
      nav: [
        {
          id: "resources",
          label: "resources",
          icon: "./assets/images/res.png",
        },
        {
          id: "tools",
          label: "tools",
          icon: "./assets/images/tools.png",
        },
        {
          id: "changelog",
          label: "changelog",
          icon: "./assets/images/log.png",
        },
        { id: "about", label: "about", icon: "./assets/images/about.png" },
      ],
      typeIcons: {
        pdf: "./assets/images/pdf.png",
        website: "./assets/images/website.png",
        videos: "./assets/images/videos.png",
        git: "./assets/images/git.png",
      },
      people: [],
      resources: [],
      changelog: [],
    };
  },
  computed: {
    authorMap() {
      return Object.fromEntries(this.people.map((p) => [p.id, p]));
    },
    currentPageIcon() {
      const page = this.nav.find((item) => item.id === this.currentPage);
      return page ? page.icon : null;
    },
  },
  mounted() {
    this.loadData();

    // startup sound
    const audio = document.getElementById("startup-sound");
    if (audio) {
      audio.play().catch(() => {
        const playOnClick = () => {
          audio.play();
          document.removeEventListener("click", playOnClick);
        };
        document.addEventListener("click", playOnClick);
      });
    }
  },
  methods: {
    async loadData() {
      try {
        // ✅ Fixed API paths (no more /api/ prefix)
        const health = await fetch(`${API_BASE}/health`);
        if (health.status === 503) {
          this.maintenance = true;
          return;
        }

        const [resourcesRes, changelogRes, peopleRes] = await Promise.all([
          fetch(`${API_BASE}/resources`),
          fetch(`${API_BASE}/changelog`),
          fetch(`${API_BASE}/people`),
        ]);

        this.resources = await resourcesRes.json();
        this.changelog = await changelogRes.json();
        this.people = await peopleRes.json();
      } catch (e) {
        console.error(e);
        this.maintenance = true;
      } finally {
        this.loading = false;
      }
    },

    navigateResource(path) {
      if (!path) return;
      window.open(path, "_blank");
    },
  },
}).mount("#app");