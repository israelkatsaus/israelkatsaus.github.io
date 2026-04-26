let articles = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadNavbar();
  await loadFooter();
  await loadNews();

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (window.location.pathname.includes("uutinen.html")) {
    renderArticle(id);
  }

  if (window.location.pathname.includes("archive.html")) {
    renderArchive();
  }

  if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
    renderFrontPage();
  }

  setupSearch();
});

async function loadNews() {
  const res = await fetch("news.json");
  const data = await res.json();
  articles = data.articles.sort((a,b) => new Date(b.date) - new Date(a.date));
}

async function loadNavbar() {
  document.getElementById("navbar").innerHTML = await fetch("navbar.html").then(r => r.text());
}

async function loadFooter() {
  document.getElementById("footer").innerHTML = await fetch("footer.html").then(r => r.text());
}

/* FRONT PAGE */
function renderFrontPage() {
  if (!articles.length) return;

  const main = document.getElementById("mainNews");
  const small = document.getElementById("smallNews");

  const [first, ...rest] = articles;

  main.innerHTML = createCard(first, true);

  small.innerHTML = rest.slice(0,4).map(a => createCard(a)).join("");
}

/* ARTICLE */
function renderArticle(id) {
  const article = articles.find(a => a.id == id);
  if (!article) return;

  const container = document.getElementById("articleContent");

  container.innerHTML = `
    <h1>${article.title}</h1>
    <img class="article-img" src="${article.image}">
    <div>${article.content}</div>

    <div class="share">
      <img src="images/facebook.png">
      <img src="images/x.png">
      <img src="images/whatsapp.png">
    </div>

    <div class="divider"></div>

    <div style="display:flex;align-items:center;gap:10px;">
      <img src="assets/LOGO3.png" style="height:25px;">
      <span>Israel-katsaus</span>
    </div>
  `;

  const latest = document.getElementById("latestNews");
  latest.innerHTML = articles.slice(0,5).map(createMini).join("");
}

/* ARCHIVE */
function renderArchive() {
  const list = document.getElementById("archiveList");
  list.innerHTML = articles.map(createCard).join("");
}

/* CARD */
function createCard(a, big=false) {
  return `
    <div onclick="openArticle(${a.id})" style="cursor:pointer">
      <h3>${a.title}</h3>
      <img src="${a.image}" style="width:100%;margin-top:8px;margin-bottom:8px;">
      ${big ? `<p>${a.excerpt}</p>` : ""}
    </div>
  `;
}

function createMini(a) {
  return `<div onclick="openArticle(${a.id})" style="cursor:pointer;margin-bottom:10px">
    ${a.title}
  </div>`;
}

function openArticle(id) {
  window.location.href = `uutinen.html?id=${id}`;
}

/* SEARCH (title > excerpt > content) */
function setupSearch() {
  document.addEventListener("input", (e) => {
    if (e.target.id !== "searchInput") return;

    const q = e.target.value.toLowerCase();

    const filtered = articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q)
    );

    if (window.location.pathname.includes("archive.html")) {
      document.getElementById("archiveList").innerHTML = filtered.map(createCard).join("");
    }
  });
}
