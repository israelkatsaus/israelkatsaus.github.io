/* ==============================
GLOBAL GUARD (ESTÄ TUPLAINIT)
============================== */

if (!window.__appInitialized) {
  window.__appInitialized = true;

  document.addEventListener("DOMContentLoaded", async () => {
    await loadNavbar();
    await loadFooter();

    // odota render cycle
    requestAnimationFrame(async () => {
      await initSearch();
      await loadNews();
      await loadArticle();
      await loadLatest();
    });
  });
}


/* ==============================
LOAD MODULES
============================== */

async function loadNavbar() {
  const container = document.getElementById("navbar");
  if (!container || container.innerHTML.trim() !== "") return;

  try {
    const res = await fetch("navbar.html");
    const html = await res.text();
    container.innerHTML = html;
  } catch (err) {
    console.error("Navbar load error:", err);
  }
}

async function loadFooter() {
  const container = document.getElementById("footer");
  if (!container || container.innerHTML.trim() !== "") return;

  try {
    const res = await fetch("footer.html");
    const html = await res.text();
    container.innerHTML = html;
  } catch (err) {
    console.error("Footer load error:", err);
  }
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
  return document.getElementById("archiveContainer")
    || document.getElementById("newsContainer");
}


/* ==============================
NEWS
============================== */

async function loadNews() {
  const container = getContainer();
  if (!container) return; // ei etusivulla

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
  if (!input) return; // ei etusivulla

  try {
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

  } catch (err) {
    console.error("Search error:", err);
  }
}


/* ==============================
ARTICLE PAGE
============================== */

async function loadArticle() {
  const articleContainer = document.getElementById("article");
  if (!articleContainer) return; // ei article-sivulla

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    articleContainer.innerHTML = "<p>Uutista ei löytynyt.</p>";
    return;
  }

  try {
    const res = await fetch("news.json");
    const data = await res.json();

    const article = data.articles.find(a => a.id == id);

    if (!article) {
      articleContainer.innerHTML = "<p>Uutista ei löytynyt.</p>";
      return;
    }

    document.title = article.title;

    articleContainer.innerHTML = `
      <div class="article-header">
        <img src="${article.image}" alt="${article.title}">
        <p class="category">${article.category || ""}</p>
        <h1 class="article-title">${article.title}</h1>
        <p class="article-meta">${article.date || ""}</p>
      </div>

      <div class="article-content">
        ${article.content
          .split("\n\n")
          .map(p => `<p>${p}</p>`)
          .join("")}
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
  const latestContainer = document.getElementById("latest");
  if (!latestContainer) return; // ei article-sivulla

  try {
    const res = await fetch("news.json");
    const data = await res.json();

    const latest = data.articles.slice(0, 5);

    latestContainer.innerHTML = latest.map(a => `
      <a class="sidebar-link" href="uutinen.html?id=${a.id}">
        ${a.title}
      </a>
    `).join("");

  } catch (err) {
    console.error("Latest load error:", err);
  }
}
