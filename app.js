const { createApp } = Vue;
const API_BASE = "https://lowlevelnotes-api.grimy86.workers.dev";

createApp({
  data() {
    return {
      loading : true,

      site: {
          name: "lowlevelnotes",
          url: "https://lowlevelnotes.com",
          description:
            "Structured notes on programming, low-level concepts, and system internals.",
          license: "MIT",
          repository: "https://github.com/grimy86/lowlevelnotes",
          version: "4.1.0"
        },

      currentPage: "home",

      nav: [
        { id: "home", label: "Home" },
        { id: "changelog", label: "Changelog" },
        { id: "contribute", label: "Contribute" }
      ],

      people: [],
      resources: [],
      changelog: []
    };
  },

  computed: {
    authorMap() {
      return Object.fromEntries(this.people.map(p => [p.id, p]));
    },

    featuredResources() {
      return this.resources.filter(r => r.featured);
    },

    publishedResources() {
      return this.resources.filter(r => r.status === "published");
    },

    navIndex() {
      return this.nav.findIndex(n => n.id === this.currentPage);
    }
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
          fetch(`${API_BASE}/api/people`)
        ]);

        this.resources = await resourcesRes.json();
        this.changelog = await changelogRes.json();
        this.people = await peopleRes.json();

        // LOAD VIEWS FROM SERVER
        for (const r of this.resources) {
          if (r.status !== "published") continue;

          const res = await fetch(`${API_BASE}/api/resource/${r.id}`);
          const data = await res.json();
          r.views = data.views;
        }

      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        this.loading = false;
      }
    },

    async openResource(resource) {
      const res = await fetch(
        `${API_BASE}/api/resource/${resource.id}`,
        { method: "POST" }
      );

      const data = await res.json();
      resource.views = data.views;

      window.open(resource.path, "_blank");
    }
  }
}).mount("#app");