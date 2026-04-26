let newsData = [];

async function loadPartials() {
  const [nav, foot] = await Promise.all([
    fetch('navbar.html').then(r => r.text()),
    fetch('footer.html').then(r => r.text())
  ]);

  const n = document.getElementById('navbar');
  const f = document.getElementById('footer');

  if (n) n.innerHTML = nav;
  if (f) f.innerHTML = foot;
}

async function loadNews() {
  const res = await fetch('news.json');
  newsData = await res.json();

  renderHome();
  renderArchive();
  bindSearch();
  renderArticlePage();
}

function renderHome() {
  const main = document.getElementById('mainNews');
  const side = document.getElementById('sideNews');
  if (!main || !side) return;

  const sorted = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));

  const [mainNews, ...rest] = sorted;

  if (mainNews) {
    main.innerHTML = `
      <a class="main-card" href="uutinen.html?id=${mainNews.id}">
        <img src="${mainNews.image}" />
        <h2>${mainNews.title}</h2>
        <p>${mainNews.excerpt}</p>
      </a>
    `;
  }

  side.innerHTML = rest.slice(0, 4).map(n => `
    <a class="small-card" href="uutinen.html?id=${n.id}">
      <img src="${n.image}" />
      <div>
        <h4>${n.title}</h4>
      </div>
    </a>
  `).join('');
}

function renderArchive() {
  const el = document.getElementById('archiveList');
  if (!el) return;

  const sorted = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));

  el.innerHTML = sorted.map(n => `
    <a class="archive-item" href="uutinen.html?id=${n.id}">
      <img src="${n.image}" />
      <div>
        <h3>${n.title}</h3>
        <p>${n.excerpt}</p>
      </div>
    </a>
  `).join('');
}

function renderArticlePage() {
  const el = document.getElementById('articleContent');
  if (!el || newsData.length === 0) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const article = newsData.find(n => n.id == id);
  if (!article) return;

  const paragraphs = article.content
    .split('</p><p>')
    .map(p => `<p>${p.replace('<p>', '').replace('</p>', '')}</p>`)
    .join('\n\n');

  el.innerHTML = `
    <h1>${article.title}</h1>
    <img class="article-img" src="${article.image}" />
    <div class="article-text">${paragraphs}</div>

    <div class="share">
      <img src="images/facebook.png" />
      <img src="images/x.png" />
      <img src="images/whatsapp.png" />
    </div>

    <div class="divider"></div>

    <div class="brand">
      <img src="assets/LOGO3.png" />
      <span>Israel-katsaus</span>
    </div>
  `;

  renderLatest();
}

function renderLatest() {
  const el = document.getElementById('latestNews');
  if (!el) return;

  const sorted = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));

  el.innerHTML = sorted.slice(0, 5).map(n => `
    <a href="uutinen.html?id=${n.id}" class="latest-item">${n.title}</a>
  `).join('');
}

function bindSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();

    const filtered = newsData.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.excerpt.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
    );

    const main = document.getElementById('mainNews');
    const side = document.getElementById('sideNews');
    const archive = document.getElementById('archiveList');

    if (main && side) {
      renderFilteredHome(filtered);
    }

    if (archive) {
      archive.innerHTML = filtered.map(n => `
        <a class="archive-item" href="uutinen.html?id=${n.id}">
          <img src="${n.image}" />
          <div><h3>${n.title}</h3></div>
        </a>
      `).join('');
    }
  });
}

function renderFilteredHome(list) {
  const main = document.getElementById('mainNews');
  const side = document.getElementById('sideNews');

  const [mainNews, ...rest] = list;

  if (mainNews) {
    main.innerHTML = `
      <a class="main-card" href="uutinen.html?id=${mainNews.id}">
        <img src="${mainNews.image}" />
        <h2>${mainNews.title}</h2>
        <p>${mainNews.excerpt}</p>
      </a>
    `;
  }

  side.innerHTML = rest.slice(0, 4).map(n => `
    <a class="small-card" href="uutinen.html?id=${n.id}">
      <img src="${n.image}" />
      <h4>${n.title}</h4>
    </a>
  `).join('');
}

(async function init() {
  await loadPartials();
  await loadNews();
})();
