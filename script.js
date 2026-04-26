/* ==============================
INIT (YHTEINEN KAIKILLE SIVUILLE)
============================== */

document.addEventListener("DOMContentLoaded", async () => {

  await loadNavbar();
  await loadFooter();

  requestAnimationFrame(async () => {
    await initSearch();
    await loadNews();     // etusivu / archive
    await loadArticle();  // uutinen.html
    await loadLatest();   // sidebar
  });

});


/* ==============================
LOAD NAVBAR / FOOTER
============================== */

async function loadNavbar() {
  const el = document.getElementById("navbar");
  if (!el) return;

  const res = await fetch("navbar.html");
  el.innerHTML = await res.text();
}

async function loadFooter() {
  const el = document.getElementById("footer");
  if (!el) return;

  const res = await fetch("footer.html");
  el.innerHTML = await res.text();
}


/* ==============================
MENU
============================== */

function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("active");
}

function closeMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.remove("active");
}

document.addEventListener("click", (e) => {
  const nav = document.getElementById("navLinks");
  if (!nav) return;

  if (
    e.target.closest(".nav-links a") ||
    (!e.target.closest(".nav-links") && !e.target.closest(".menu"))
  ) {
    closeMenu();
  }
});


/* ==============================
UTIL
============================== */

function getContainer() {
  return document.getElementById("newsContainer")
      || document.getElementById("archiveContainer");
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || "";
}


/* ==============================
LOAD NEWS (etusivu + archive)
============================== */

async function loadNews() {
  const container = getContainer();
  if (!container) return;

  try {
    const res = await fetch("news.json");
    const data = await res.json();

    const articles = (data.articles || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    renderArticles(articles);

  } catch (err) {
    console.error("News load error:", err);
  }
}


/* ==============================
RENDER FRONT PAGE
============================== */

function renderFrontPage(articles, container) {
  if (!articles.length) return;

  const main = articles[0];

  container.innerHTML = `
    <a href="uutinen.html?id=${main.id}" class="main-article">
      <img src="${main.image}" alt="${main.title}">
      <div class="main-text">
        <h2>${main.title}</h2>
        <p>${main.excerpt || ""}</p>
      </div>
    </a>

    <div class="small-news">
      ${articles.slice(1, 5).map(a => `
        <a href="uutinen.html?id=${a.id}" class="news-card">
          <img src="${a.image}" alt="${a.title}">
          <h3>${a.title}</h3>
        </a>
      `).join("")}
    </div>
  `;
}


/* ==============================
RENDER ARCHIVE
============================== */

function renderArchive(articles, container) {
  container.innerHTML = `
    <div class="grid">
      ${articles.map(a => `
        <a href="uutinen.html?id=${a.id}" class="card">
          <img src="${a.image}" alt="">
          <h2>${a.title}</h2>
          <p>${a.date}</p>
          <p>${a.excerpt || ""}</p>
        </a>
      `).join("")}
    </div>
  `;
}


/* ==============================
SWITCH
============================== */

function renderArticles(articles) {
  const container = getContainer();
  if (!container) return;

  if (container.id === "archiveContainer") {
    renderArchive(articles, container);
  } else {
    renderFrontPage(articles, container);
  }
}


/* ==============================
SEARCH
============================== */

function scoreArticle(a, q) {
  const title = (a.title || "").toLowerCase();
  const excerpt = (a.excerpt || "").toLowerCase();
  const content = stripHtml(a.content || "").toLowerCase();

  let score = 0;

  if (title.includes(q)) score += 50;
  if (excerpt.includes(q)) score += 30;
  if (content.includes(q)) score += 10;

  return score;
}

async function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const res = await fetch("news.json");
  const data = await res.json();
  const articles = data.articles || [];

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();

    if (!q) {
      loadNews();
      return;
    }

    const results = articles
      .map(a => ({ ...a, score: scoreArticle(a, q) }))
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score);

    renderArticles(results);
  });
}


/* ==============================
ARTICLE PAGE (🔥 KORJATTU)
============================== */

async function loadArticle() {
  const container = document.getElementById("article");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    container.innerHTML = "<p>Uutista ei löytynyt.</p>";
    return;
  }

  try {
    const res = await fetch("news.json");
    const data = await res.json();

    const article = data.articles.find(a => a.id == id);

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

      <div class="share-buttons">
        <a href="https://www.facebook.com/sharer/sharer.php?u=${window.location.href}" target="_blank">
          <img src="images/facebook.png" alt="Facebook">
        </a>

        <a href="https://twitter.com/intent/tweet?url=${window.location.href}&text=${article.title}" target="_blank">
          <img src="images/x.png" alt="X">
        </a>

        <a href="https://api.whatsapp.com/send?text=${article.title} ${window.location.href}" target="_blank">
          <img src="images/whatsapp.png" alt="WhatsApp">
        </a>
      </div>

      <div class="article-source">
        <img src="assets/LOGO3.png" alt="Israel-katsaus">
        <span>Israel-katsaus</span>
      </div>
    `;

  } catch (err) {
    console.error("Article load error:", err);
  }
}


/* ==============================
LATEST SIDEBAR
============================== */

async function loadLatest() {
  const el = document.getElementById("latest");
  if (!el) return;

  try {
    const res = await fetch("news.json");
    const data = await res.json();

    const latest = data.articles.slice(0, 5);

    el.innerHTML = latest.map(a => `
      <a class="sidebar-link" href="uutinen.html?id=${a.id}">
        ${a.title}
      </a>
    `).join("");

  } catch (err) {
    console.error("Latest load error:", err);
  }
}
