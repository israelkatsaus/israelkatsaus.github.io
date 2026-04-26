document.addEventListener('DOMContentLoaded', () => {
    // Lataa ylä- ja alapalkki
    Promise.all([
        fetch('navbar.html').then(res => res.text()),
        fetch('footer.html').then(res => res.text())
    ]).then(([nav, footer]) => {
        document.getElementById('navbar-placeholder').innerHTML = nav;
        document.getElementById('footer-placeholder').innerHTML = footer;
        setupCommonFeatures();
        loadNews();
    });
});

function setupCommonFeatures() {
    // Mobiilivalikko
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-menu');
    if (btn) {
        btn.addEventListener('click', () => menu.classList.toggle('open'));
    }

    // Hakutoiminto
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.location.href = `archive.html?query=${searchInput.value}`;
            }
        });
    }
}

async function loadNews() {
    const response = await fetch('news.json');
    const data = await response.json();
    let articles = data.articles;

    // Lajitellaan uusimmasta alkaen
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    if (path.includes('index.html') || path === '/') {
        renderFrontPage(articles);
    } else if (path.includes('archive.html')) {
        const query = urlParams.get('query');
        renderArchive(articles, query);
    } else if (path.includes('uutinen.html')) {
        const id = urlParams.get('id');
        renderSingleArticle(articles, id);
    }
}

function renderFrontPage(articles) {
    const container = document.getElementById('front-page-content');
    if (!container) return;

    const main = articles[0];
    const smallOnes = articles.slice(1, 5);

    let html = `
        <div class="main-article">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}" alt="">
                <h2>${main.title}</h2>
                <p>${main.excerpt}</p>
            </a>
        </div>
        <div class="small-news-side-grid">
    `;

    smallOnes.forEach(art => {
        html += `
            <div class="small-article">
                <a href="uutinen.html?id=${art.id}">
                    <img src="${art.image}" alt="">
                    <h3>${art.title}</h3>
                </a>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function renderArchive(articles, query) {
    const grid = document.getElementById('archive-grid');
    let filtered = articles;

    if (query) {
        const q = query.toLowerCase();
        // Haku tärkeysjärjestyksessä: 1. Otsikko, 2. Ingressi, 3. Sisältö
        filtered = articles.filter(a => 
            a.title.toLowerCase().includes(q) || 
            a.excerpt.toLowerCase().includes(q) || 
            a.content.toLowerCase().includes(q)
        ).sort((a, b) => {
            if (a.title.toLowerCase().includes(q) && !b.title.toLowerCase().includes(q)) return -1;
            if (a.excerpt.toLowerCase().includes(q) && !b.excerpt.toLowerCase().includes(q)) return -1;
            return 0;
        });
    }

    grid.innerHTML = filtered.map(art => `
        <div class="archive-item">
            <a href="uutinen.html?id=${art.id}">
                <img src="${art.image}" alt="">
                <h3>${art.title}</h3>
            </a>
        </div>
    `).join('');
}

function renderSingleArticle(articles, id) {
    const article = articles.find(a => a.id == id) || articles[0];
    const articleView = document.getElementById('article-view');
    const sidebarList = document.getElementById('sidebar-list');

    articleView.innerHTML = `
        <h1>${article.title}</h1>
        <div class="excerpt">${article.excerpt}</div>
        <img src="${article.image}" alt="">
        <div class="article-content">${article.content}</div>
        
        <div class="social-sharing">
            <img src="images/facebook.png" alt="Facebook">
            <img src="images/x.png" alt="X">
            <img src="images/whatsapp.png" alt="Whatsapp">
        </div>
        <div class="divider"></div>
        <div class="author-box">
            <img src="assets/LOGO3.png" alt="">
            <span>Israel-katsaus</span>
        </div>
    `;

    // Uusimmat uutiset sivupalkkiin (pl. nykyinen)
    const latest = articles.filter(a => a.id != article.id).slice(0, 5);
    sidebarList.innerHTML = latest.map(art => `
        <div class="small-article" style="margin-bottom:20px;">
            <a href="uutinen.html?id=${art.id}">
                <img src="${art.image}" alt="">
                <h3 style="font-size:0.9rem;">${art.title}</h3>
            </a>
        </div>
    `).join('');
}
