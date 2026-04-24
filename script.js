/* =========================================
APP CORE (SINGLE ENTRY)
========================================= */

const App = {
  data: null,

  async init() {
    await this.loadGlobalUI();
    this.data = await this.fetchNews();

    this.route();
  },

  /* =========================
  GLOBAL UI
  ========================= */

  async loadGlobalUI() {
    await this.loadNavbar();
    await this.loadFooter();
  },

  async loadNavbar() {
    const el = document.getElementById("navbar");
    if (!el) return;

    const res = await fetch("navbar.html");
    el.innerHTML = await res.text();
  },

  async loadFooter() {
    const el = document.getElementById("footer");
    if (!el) return;

    const res = await fetch("footer.html");
    el.innerHTML = await res.text();
  },

  /* =========================
  DATA
  ========================= */

  async fetchNews() {
    try {
      const res = await fetch("news.json");
      const data = await res.json();

      return (data.articles || [])
        .filter(a => a.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    } catch (err) {
      console.error("News fetch error:", err);
      return [];
    }
  },

  /* =========================
  ROUTER
  ========================= */

  route() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id) {
      this.renderArticle(id);
    } else {
      const archive = document.getElementById("archiveContainer");

      if (archive) {
        this.renderArchive();
      } else {
        this.renderHome();
      }
    }
  },

  /* =========================
  HOME
  ========================= */

  renderHome() {
    const container = document.getElementById("newsContainer");
    if (!container || !this.data.length) return;

    const main = this.data[0];
    const rest = this.data.slice(1, 5);

    container.innerHTML = `
      <a class="main-article" href="uutinen.html?id=${main.id}">
        <img src="${main.image}" alt="${main.title}">
        <div class="main-text">
          <h2>${main.title}</h2>
          <p>${main.excerpt || ""}</p>
        </div>
      </a>

      <div class="small-news">
        ${rest.map(a => `
          <a class="news-card" href="uutinen.html?id=${a.id}">
            <img src="${a.image}" alt="${a.title}">
            <h3>${a.title}</h3>
          </a>
        `).join("")}
      </div>
    `;
  },

  /* =========================
  ARTICLE
  ========================= */

  renderArticle(id) {
    const container = document.getElementById("article");
    if (!container) return;

    const article = this.data.find(a => a.id == id);

    if (!article) {
      container.innerHTML = "<p>Uutista ei löytynyt.</p>";
      return;
    }

    document.title = article.title;

    container.innerHTML = `
      <div class="article-header">
        <img src="${article.image}" alt="${article.title}">
        <p class="category">${article.category || ""}</p>
        <h1 class="article-title">${article.title}</h1>
        <p class="article-meta">${article.date || ""}</p>
      </div>

      <div class="article-content">
        ${article.content}
      </div>
    `;
  },

  /* =========================
  ARCHIVE
  ========================= */

  renderArchive() {
    const container = document.getElementById("archiveContainer");
    if (!container) return;

    container.innerHTML = `
      <div class="grid">
        ${this.data.map(a => `
          <a class="card" href="uutinen.html?id=${a.id}">
            <img src="${a.image}" alt="${a.title}">
            <h2>${a.title}</h2>
            <p>${a.date}</p>
            <p>${a.excerpt || ""}</p>
          </a>
        `).join("")}
      </div>
    `;
  }
};

/* =========================================
START (ONLY ONE ENTRY POINT)
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
