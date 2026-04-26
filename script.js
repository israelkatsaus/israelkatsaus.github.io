let newsData = [];

async function loadNews() {
  const res = await fetch("news.json");
  newsData = await res.json();
  initPage();
}

function initPage() {
  loadNavbar();
  loadFooter();
  setupSearch();

  if (document.getElementById("mainFeature")) loadIndex();
  if (document.getElementById("archiveList")) loadArchive();
  if (document.getElementById("articleContent")) loadArticle();
}

function loadNavbar() {
  fetch("navbar.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("navbar").innerHTML = html;
      setupSearch();
    });
}

function loadFooter() {
  fetch("footer.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("footer").innerHTML = html;
    });
}

/* SEARCH (global) */
function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    localStorage.setItem("search", q);
    filterNews(q);
  });
}

function filterNews(q) {
  const filtered = newsData.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.excerpt.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q)
  );

  if (document.getElementById("archiveList")) {
    renderArchive(filtered);
  }
}

/* INDEX */
function loadIndex() {
  const sorted = [...newsData].sort((a,b)=> new Date(b.date)-new Date(a.date));

  const main = sorted[0];
  const rest = sorted.slice(1,5);

  document.getElementById("mainFeature").innerHTML = `
    <img src="${main.image}">
    <h2><a href="uutinen.html?id=${main.id}">${main.title}</a></h2>
    <p>${main.excerpt}</p>
  `;

  document.getElementById("sideNews").innerHTML = rest.map(n => `
    <div class="small-news">
      <img src="${n.image}">
      <a href="uutinen.html?id=${n.id}">${n.title}</a>
    </div>
  `).join("");
}

/* ARCHIVE */
function loadArchive() {
  renderArchive(newsData.sort((a,b)=> new Date(b.date)-new Date(a.date)));
}

function renderArchive(list) {
  document.getElementById("archiveList").innerHTML = list.map(n => `
    <div class="small-news">
      <img src="${n.image}">
      <a href="uutinen.html?id=${n.id}">${n.title}</a>
      <p>${n.date}</p>
    </div>
  `).join("");
}

/* ARTICLE */
function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const article = newsData.find(n => n.id == id);
  if (!article) return;

  const formatted = article.content.split("</p><p>").join("<br><br>");

  document.getElementById("articleContent").innerHTML = `
    <img src="${article.image}">
    <h1>${article.title}</h1>
    <div class="article-text"><p>${formatted}</p></div>

    <div class="article-share">
      <img src="images/facebook.png">
      <img src="images/x.png">
      <img src="images/whatsapp.png">
    </div>

    <div class="divider"></div>

    <div style="display:flex;align-items:center;gap:10px;">
      <img src="assets/LOGO3.png" width="30">
      <span>Israel-katsaus</span>
    </div>
  `;

  const latest = [...newsData]
    .sort((a,b)=> new Date(b.date)-new Date(a.date))
    .slice(0,5);

  document.getElementById("latestNews").innerHTML = `
    <h3>Uusimmat uutiset</h3>
    ${latest.map(n=>`
      <div>
        <a href="uutinen.html?id=${n.id}">${n.title}</a>
      </div>
    `).join("")}
  `;
}

loadNews();
