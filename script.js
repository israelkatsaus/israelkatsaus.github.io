document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar-placeholder', 'navbar.html', initNavbar);
    loadComponent('footer-placeholder', 'footer.html');
    loadNews();
});

function loadComponent(id, file, callback) {
    fetch(file).then(r => r.text()).then(html => {
        document.getElementById(id).innerHTML = html;
        if(callback) callback();
    });
}

function initNavbar() {
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-menu');
    const search = document.getElementById('search-input');

    btn.addEventListener('click', () => menu.classList.toggle('open'));

    search.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            window.location.href = `archive.html?q=${encodeURIComponent(search.value)}`;
        }
    });
}

async function loadNews() {
    const res = await fetch('news.json');
    const data = await res.json();
    let articles = data.articles;
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    if (path.includes('archive.html')) {
        renderArchive(articles, urlParams.get('q'));
    } else if (path.includes('uutinen.html')) {
        renderArticle(articles, urlParams.get('id'));
    } else {
        renderFrontPage(articles);
    }
}

function renderFrontPage(articles) {
    const container = document.getElementById('front-page-content');
    if (!container) return;

    const main = articles[0];
    const side = articles.slice(1, 5);

    let html = `
        <div class="main-news-card">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}" alt="">
                <h2>${main.title}</h2>
                <p>${main.excerpt}</p>
            </a>
        </div>
        <div class="small-news-side">
            ${side.map(a => `
                <div class="small-card">
                    <a href="uutinen.html?id=${a.id}">
                        <img src="${a.image}" alt="">
                        <h3>${a.title}</h3>
                    </a>
                </div>
            `).join('')}
        </div>
    `;
    container.innerHTML = html;
}

function renderArchive(articles, query) {
    const grid = document.getElementById('archive-grid');
    let results = articles;

    if (query) {
        const q = query.toLowerCase();
        results = articles.map(a => {
            let score = 0;
            if (a.title.toLowerCase().includes(q)) score += 3;
            if (a.excerpt.toLowerCase().includes(q)) score += 2;
            if (a.content.toLowerCase().includes(q)) score += 1;
            return { ...a, score };
        }).filter(a => a.score > 0).sort((a, b) => b.score - a.score);
        document.querySelector('.archive-title').innerText = `Haun tulokset: "${query}"`;
    }

    grid.innerHTML = results.map(a => `
        <div class="small-card">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}" alt="">
                <h3>${a.title}</h3>
            </a>
        </div>
    `).join('');
}

function renderArticle(articles, id) {
    const article = articles.find(a => a.id == id) || articles[0];
    const body = document.getElementById('article-body');
    const sidebar = document.getElementById('sidebar-latest');

    const shareUrl = encodeURIComponent(window.location.href);
    const shareTitle = encodeURIComponent(article.title);

    body.innerHTML = `
        <div class="article-body-content">
            <img src="${article.image}" alt="">
            <h1>${article.title}</h1>
            <p class="excerpt">${article.excerpt}</p>
            <div class="content-text">${article.content}</div>
            
            <div class="share-bar">
                <img src="images/facebook.png" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${shareUrl}')">
                <img src="images/x.png" onclick="window.open('https://x.com/intent/tweet?url=${shareUrl}&text=${shareTitle}')">
                <img src="images/whatsapp.png" onclick="window.open('https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}')">
            </div>
            <div class="divider"></div>
            <div class="author-info">
                <img src="assets/LOGO3.png" alt="">
                <strong>Israel-katsaus</strong>
            </div>
        </div>
    `;

    sidebar.innerHTML = articles.filter(a => a.id != article.id).slice(0, 6).map(a => `
        <div class="small-card" style="margin-bottom: 20px;">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}" alt="">
                <h3 style="font-size: 0.9rem;">${a.title}</h3>
            </a>
        </div>
    `).join('');
}
