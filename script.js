/* ==============================
LOAD MODULES
============================== */

async function loadNavbar() {
  const res = await fetch("navbar.html");
  const html = await res.text();

  const container = document.getElementById("navbar");
  if (container) container.innerHTML = html;
}

async function loadFooter() {
  const res = await fetch("footer.html");
  const html = await res.text();

  const container = document.getElementById("footer");
  if (container) container.innerHTML = html;
}


/* ==============================
MENU (MOBILE SAFE)
============================== */

function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("active");
}

function closeMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.remove("active");
}

/* sulje menu turvallisesti */
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

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
}

function getContainer() {
  const archive = document.getElementById("archiveContainer");
  const news = document.getElementById("newsContainer");

  return archive || news;
}


/* ==============================
LOAD NEWS
============================== */

async function loadNews() {
  try {
    const res = await fetch("news.json");
    const data = await res.json();

    const articles = (data.articles || [])
      .filter(a => a.date)
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
  const main = articles[0];

  let html = `
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

  container.innerHTML = html;
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
RENDER SWITCH
============================== */

function renderArticles(articles) {
  const container = getContainer();
  if (!container || !articles.length) return;

  if (container.id === "archiveContainer") {
    renderArchive(articles, container);
  } else {
    renderFrontPage(articles, container);
  }
}


/* ==============================
GOOGLE-STYLE SCORING
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


/* ==============================
SEARCH (STABLE + MOBILE SAFE)
============================== */

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
INIT (FIXED - NO TIMEOUT HACKS)
============================== */

document.addEventListener("DOMContentLoaded", async () => {

  // 1. load UI
  await loadNavbar();
  await loadFooter();

  // 2. wait safe DOM paint cycle
  requestAnimationFrame(async () => {
    await initSearch();
    await loadNews();
  });

});
