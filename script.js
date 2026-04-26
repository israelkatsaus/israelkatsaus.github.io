let newsData = [];

// LOAD PARTIALS
async function loadPartials() {
  document.getElementById("navbar").innerHTML = await fetch("navbar.html").then(r => r.text());
  document.getElementById("footer").innerHTML = await fetch("footer.html").then(r => r.text());
}

// LOAD NEWS
async function loadNews() {
  const res = await fetch("news.json");
  const data = await res.json();
  newsData = data.articles.sort((a,b)=> new Date(b.date)-new Date(a.date));

  renderIndex();
  renderArchive();
  renderArticlePage();
}

function renderIndex() {
  if (!document.getElementById("mainNews")) return;

  const main = newsData[0];
  const side = newsData.slice(1,5);

  document.getElementById("mainNews").innerHTML = newsCard(main, true);

  document.getElementById("sideNews").innerHTML =
    side.map(n => newsCard(n)).join("");
}

function renderArchive() {
  const el = document.getElementById("archiveList");
  if (!el) return;

  el.innerHTML = newsData.map(n => newsCard(n)).join("");
}

function renderArticlePage() {
  const el = document.getElementById("article");
  if (!el) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const article = newsData.find(n => n.id == id);

  if (!article) return;

  el.innerHTML = `
    <h1>${article.title}</h1>
    <img src="${article.image}" style="width:100%; margin-top:10px;">
    <div>${article.content.replace(/<p>/g,"<p style='margin-bottom:15px'>")}</div>

    <div class="share">
      <img src="images/facebook.png">
      <img src="images/x.png">
      <img src="images/whatsapp.png">
    </div>

    <hr>

    <div style="display:flex; align-items:center; gap:10px;">
      <img src="assets/LOGO3.png" width="25">
      <span>Israel-katsaus</span>
    </div>
  `;

  const latest = document.getElementById("latestNews");
  if (latest) {
    latest.innerHTML = newsData.slice(0,5)
      .map(n => `<div class="news-card">${n.title}</div>`).join("");
  }
}

// NEWS CARD
function newsCard(n, big=false) {
  return `
    <div class="news-card" style="${big ? "font-size:18px" : ""}">
      <a href="uutinen.html?id=${n.id}" style="text-decoration:none;color:black">
        <img src="${n.image}" style="width:100%; margin-top:10px; border-radius:4px;">
        <h3 style="margin-top:10px">${n.title}</h3>
        <p>${n.excerpt}</p>
      </a>
    </div>
  `;
}

// SEARCH
document.addEventListener("input", (e) => {
  if (e.target.id !== "searchInput") return;

  const q = e.target.value.toLowerCase();

  const filtered = newsData.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.excerpt.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q)
  );

  const main = document.getElementById("mainNews");
  const side = document.getElementById("sideNews");

  if (main && side) {
    main.innerHTML = filtered[0] ? newsCard(filtered[0], true) : "";
    side.innerHTML = filtered.slice(1,5).map(newsCard).join("");
  }
});

loadPartials().then(loadNews);
