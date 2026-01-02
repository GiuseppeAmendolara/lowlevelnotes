const { createApp } = Vue;
const API_BASE = "https://lowlevelnotes-api.grimy86.workers.dev";

createApp({
  components: { MarkdownView },
  data() {
    return {
      loading: true,

      site: {
        name: "lowlevelnotes",
        url: "https://lowlevelnotes.com",
        description:
          "Structured notes on programming, low-level concepts, and system internals.",
        license: "MIT License",
        legal: "https://github.com/grimy86/lowlevelnotes/blob/main/LICENSE",
        repository: "https://github.com/grimy86/lowlevelnotes",
        projects: "20+ projects",
        discord: "active in 3 discord servers",
        private: "no tracking, no ads",
        openSource: "fully open source",
        collection:
          "private access to a curated collection of books, articles, and videos",
      },

      currentPage: "home",

      nav: [
        { id: "home", label: "Home" },
        { id: "references", label: "References" },
        { id: "changelog", label: "Changelog" },
        { id: "contribute", label: "Contribute" },
      ],

      people: [],
      resources: [],
      changelog: [],
    };
  },

  computed: {
    authorMap() {
      return Object.fromEntries(this.people.map((p) => [p.id, p]));
    },

    featuredPublished() {
      return this.resources.filter(
        (r) => r.featured && r.status === "published"
      );
    },

    featuredDrafts() {
      return this.resources.filter((r) => r.featured && r.status === "draft");
    },

    navIndex() {
      return this.nav.findIndex((n) => n.id === this.currentPage);
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    async loadData() {
      try {
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
      } finally {
        this.loading = false;
      }
    },

    async openResource(resource) {
      const res = await fetch(`${API_BASE}/api/resource/${resource.id}`, {
        method: "POST",
      });

      const data = await res.json();
      resource.views = data.views;

      window.open(resource.path, "_blank");
    },
  },
}).mount("#app");
