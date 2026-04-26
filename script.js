/* ==============================
INIT (SAFE BOOT)
============================== */

document.addEventListener("DOMContentLoaded", async () => {

  try {
    await loadNavbar();
    await loadFooter();
  } catch (e) {
    console.error("Layout load error:", e);
  }

  // SAFE START (ei kaada sivua jos yksi funktio puuttuu)
  setTimeout(async () => {

    // SEARCH (SAFE)
    try {
      if (typeof initSearch === "function") {
        await initSearch();
      }
    } catch (e) {
      console.warn("Search not loaded:", e);
    }

    // NEWS / ARCHIVE
    const hasNews = document.getElementById("newsContainer");
    const hasArchive = document.getElementById("archiveContainer");

    if (hasNews || hasArchive) {
      loadNews();
    }

    // ARTICLE
    if (document.getElementById("article")) {
      loadArticle();
    }

    // LATEST SIDEBAR
    if (document.getElementById("latest")) {
      loadLatest();
    }

  }, 50);
});


/* ==============================
NAVBAR / FOOTER
============================== */

async function loadNavbar() {
  const el = document.getElementById("navbar");
  if (!el) return;

  try {
    const res = await fetch("navbar.html");
    if (!res.ok) throw new Error("Navbar failed");
    el.innerHTML = await res.text();
  } catch (e) {
    console.error("Navbar error:", e);
  }
}

async function loadFooter() {
  const el = document.getElementById("footer");
  if (!el) return;

  try {
    const res = await fetch("footer.html");
    if (!res.ok) throw new Error("Footer failed");
    el.innerHTML = await res.text();
  } catch (e) {
    console.error("Footer error:", e);
  }
}


/* ==============================
MENU
============================== */

function toggleMenu() {
  document.getElementById("navLinks")?.classList.toggle("active");
}

document.addEventListener("click", (e) => {
  const nav = document.getElementById("navLinks");
  if (!nav) return;

  if (!e.target.closest(".nav-links") && !e.target.closest(".menu")) {
    nav.classList.remove("active");
  }
});


/* ==============================
NEWS LOADER
============================== */

async function loadNews() {
  const container =
    document.getElementById("newsContainer") ||
    document.getElementById("archiveContainer");

  if (!container) return;

  try {
    const res = await fetch("news.json");
    if (!res.ok) throw new Error("news.json failed");

    const data = await res.json();

    const articles = (data.articles || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    renderArticles(articles, container);

  } catch (err) {
    console.error("News error:", err);
  }
}


/* ==============================
RENDER ARTICLES
============================== */

function renderArticles(articles, container) {
  if (!articles || !articles.length) return;

  // ARCHIVE
  if (container.id === "archiveContainer") {
    container.innerHTML = `
      <div class="grid">
        ${articles.map(a => `
          <a href="uutinen.html?id=${a.id}" class="card">
            <img src="${a.image}" alt="">
            <h2>${a.title}</h2>
            <p>${a.date || ""}</p>
            <p>${a.excerpt || ""}</p>
          </a>
        `).join("")}
      </div>
    `;
    return;
  }

  // FRONT PAGE
  const main = articles[0];
  if (!main) return;

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
          <img src="${a.image}" alt="">
          <h3>${a.title}</h3>
        </a>
      `).join("")}
    </div>
  `;
}


/* ==============================
ARTICLE PAGE
============================== */

async function loadArticle() {
  const container = document.getElementById("article");
  if (!container) return;

  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;

  try {
    const res = await fetch("news.json");
    const data = await res.json();

    const article = data.articles?.find(a => a.id == id);
    if (!article) return;

    document.title = article.title;

    container.innerHTML = `
      <div class="article-header">
        <img src="${article.image}" alt="${article.title}">
        <h1 class="article-title">${article.title}</h1>
        <p class="article-meta">${article.date || ""}</p>
      </div>

      <div class="article-content">
        ${article.content || ""}
      </div>

      <div class="share-buttons">
        <a href="https://www.facebook.com/sharer/sharer.php?u=${location.href}" target="_blank">
          <img src="images/facebook.png" alt="">
        </a>

        <a href="https://twitter.com/intent/tweet?url=${location.href}" target="_blank">
          <img src="images/x.png" alt="">
        </a>

        <a href="https://api.whatsapp.com/send?text=${article.title} ${location.href}" target="_blank">
          <img src="images/whatsapp.png" alt="">
        </a>
      </div>

      <div class="article-source">
        <img src="assets/LOGO3.png" alt="">
        <span>Israel-katsaus</span>
      </div>
    `;

  } catch (e) {
    console.error("Article error:", e);
  }
}


/* ==============================
LATEST NEWS
============================== */

async function loadLatest() {
  const el = document.getElementById("latest");
  if (!el) return;

  try {
    const res = await fetch("news.json");
    const data = await res.json();

    const latest = (data.articles || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    el.innerHTML = latest.map(a => `
      <a class="latest-item" href="uutinen.html?id=${a.id}">
        <img class="latest-img" src="${a.image}" alt="${a.title}">
        <div class="latest-text">
          <div class="latest-title">${a.title}</div>
          <div class="latest-date">${a.date || ""}</div>
        </div>
      </a>
    `).join("");

  } catch (err) {
    console.error("Latest error:", err);
  }
}
