/* ==============================
LOAD MODULES (STABLE)
============================== */

async function loadNavbar() {
  const res = await fetch("navbar.html");
  const html = await res.text();

  const container = document.getElementById("navbar");
  if (container) {
    container.innerHTML = html;
  }
}

async function loadFooter() {
  const res = await fetch("footer.html");
  const html = await res.text();

  const container = document.getElementById("footer");
  if (container) {
    container.innerHTML = html;
  }
}


/* ==============================
MENU (SAFE BINDING)
============================== */

function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("active");
}

function closeMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.remove("active");
}

/* sulje menu kun klikataan linkkiä */
document.addEventListener("click", (e) => {
  if (e.target.closest(".nav-links a")) {
    closeMenu();
  }
});


/* ==============================
NEWS (FRONT PAGE)
============================== */

async function loadNews() {
  try {
    const response = await fetch("news.json");

    if (!response.ok)
      throw new Error("Uutisten lataus epäonnistui");

    const data = await response.json();

    const articles = (data && Array.isArray(data.articles))
      ? data.articles
          .filter(a => a.date)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];

    const container = document.getElementById("newsContainer");
    if (!container) return;

    if (!articles.length) {
      container.innerHTML = "<p>Ei uutisia saatavilla.</p>";
      return;
    }

    renderNewsLayout(articles);

  } catch (err) {
    console.error(err);

    const container = document.getElementById("newsContainer");
    if (container)
      container.innerHTML = "<p>Virhe uutisten latauksessa.</p>";
  }
}


/* ==============================
RENDER (YHTEINEN LAYOUT)
============================== */

function renderNewsLayout(articles) {
  const container = document.getElementById("newsContainer");
  if (!container) return;

  const main = articles[0];

  let html = `
    <a href="uutinen.html?id=${main.id}" class="main-article">
      <img src="${main.image}" alt="${main.title}" loading="lazy">
      <div class="main-text">
        <h2>${main.title}</h2>
        <p>${main.excerpt || ""}</p>
      </div>
    </a>
  `;

  html += `
    <div class="small-news">
      ${articles.slice(1, 5).map(article => `
        <a href="uutinen.html?id=${article.id}" class="news-card">
          <img src="${article.image}" alt="${article.title}" loading="lazy">
          <h3>${article.title}</h3>
        </a>
      `).join("")}
    </div>
  `;

  container.innerHTML = html;
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}


/* ==============================
SEARCH (LIVE FILTER)
============================== */

async function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  try {
    const res = await fetch("news.json");
    const data = await res.json();
    const articles = data.articles || [];

    input.addEventListener("input", () => {
      const query = input.value.toLowerCase();

      // 🔄 jos tyhjä → palauta normaalit uutiset
      if (!query) {
        loadNews();
        return;
      }

      const filtered = articles.filter(a => {
  const fullText = (
    (a.title || "") + " " +
    (a.excerpt || "") + " " +
    stripHtml(a.content || "")
  ).toLowerCase();

  return fullText.includes(query);
});

      renderSearchResults(filtered);
    });

  } catch (err) {
    console.error("Search error:", err);
  }
}


/* ==============================
SEARCH RENDER
============================== */

function renderSearchResults(results) {
  const container = document.getElementById("newsContainer");
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = "<p>Ei hakutuloksia.</p>";
    return;
  }

  renderNewsLayout(results);
}


/* ==============================
INIT (FONT SAFE)
============================== */

document.addEventListener("DOMContentLoaded", async () => {

  // odota että fontit ovat ladattu
  await document.fonts.ready;

  // lataa navbar + footer
  await loadNavbar();
  await loadFooter();

  await initSearch();

  // 🔍 käynnistä haku
  await initSearch();

  // renderöi sisältö
  requestAnimationFrame(() => {
    if (typeof loadNews === "function") loadNews();
    if (typeof loadArticle === "function") loadArticle();
    if (typeof loadLatest === "function") loadLatest();
  });

});
