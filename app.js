const { createApp } = Vue;
const API_BASE = "https://lowlevelnotes-api.grimy86.workers.dev";

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
        git: "./assets/images/git.png"
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
  },
  methods: {
    async loadData() {
      try {
        const health = await fetch(`${API_BASE}/api/health`);
        if (health.status === 503) {
          this.maintenance = true;
          return;
        }

        const [resourcesRes, changelogRes, peopleRes] = await Promise.all([
          fetch(`${API_BASE}/api/resources`),
          fetch(`${API_BASE}/api/changelog`),
          fetch(`${API_BASE}/api/people`),
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
      window.open(path, "_blank"); // opens in a new tab
    },
  },
}).mount("#app");
