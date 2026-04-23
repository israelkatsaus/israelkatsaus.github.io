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
  if (e.target.closest(".nav-links a")) {
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


/* ==============================
CONTAINER (INDEX + ARCHIVE)
============================== */

function getNewsContainer() {
  return document.getElementById("newsContainer") ||
         document.getElementById("archiveContainer");
}


/* ==============================
NEWS LOAD
============================== */

async function loadNews() {
  try {
    const res = await fetch("news.json");
    const data = await res.json();

    const articles = (data?.articles || [])
      .filter(a => a.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const container = getNewsContainer();
    if (!container) return;

    renderNewsLayout(articles);

  } catch (err) {
    console.error(err);
  }
}


/* ==============================
RENDER
============================== */

function renderNewsLayout(articles) {
  const container = getNewsContainer();
  if (!container || !articles.length) return;

  const main = articles[0];

  let html = `
    <a href="uutinen.html?id=${main.id}" class="main-article">
      <img src="${main.image}" alt="${main.title}" loading="lazy">
      <div class="main-text">
        <h2>${main.title}</h2>
        <p>${main.excerpt || ""}</p>
      </div>
    </a>

    <div class="small-news">
      ${articles.slice(1, 5).map(a => `
        <a href="uutinen.html?id=${a.id}" class="news-card">
          <img src="${a.image}" alt="${a.title}" loading="lazy">
          <h3>${a.title}</h3>
        </a>
      `).join("")}
    </div>
  `;

  container.innerHTML = html;
}


/* ==============================
GOOGLE-STYLE SEARCH
============================== */

function scoreArticle(article, query) {
  const q = query.toLowerCase();

  const title = (article.title || "").toLowerCase();
  const excerpt = (article.excerpt || "").toLowerCase();
  const content = stripHtml(article.content || "").toLowerCase();

  let score = 0;

  // 🔥 OTSIKKO = 5x paino
  if (title.includes(q)) score += 50;

  // 🟡 INGRESSI = 3x paino
  if (excerpt.includes(q)) score += 30;

  // 🔵 LEIPÄTEKSTI = 1x paino
  if (content.includes(q)) score += 10;

  return score;
}


/* ==============================
SEARCH INIT
============================== */

async function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  try {
    const res = await fetch("news.json");
    const data = await res.json();
    const articles = data.articles || [];

    input.addEventListener("input", () => {
      const query = input.value.toLowerCase().trim();

      if (!query) {
        loadNews();
        return;
      }

      const results = articles
        .map(a => ({
          ...a,
          score: scoreArticle(a, query)
        }))
        .filter(a => a.score > 0)
        .sort((a, b) => b.score - a.score);

      renderSearchResults(results);
    });

  } catch (err) {
    console.error("Search error:", err);
  }
}


/* ==============================
SEARCH RENDER
============================== */

function renderSearchResults(results) {
  const container = getNewsContainer();
  if (!container) return;

  if (!results.length) {
    container.innerHTML = "<p>Ei hakutuloksia.</p>";
    return;
  }

  renderNewsLayout(results);
}


/* ==============================
INIT
============================== */

document.addEventListener("DOMContentLoaded", async () => {

  await document.fonts.ready;

  await loadNavbar();
  await loadFooter();

  await initSearch();

  requestAnimationFrame(() => {
    loadNews();
  });

});
