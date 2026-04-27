document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar-placeholder', 'navbar.html', initNavbar);
    loadComponent('footer-placeholder', 'footer.html');
    fetchNews();
});

function loadComponent(id, file, callback) {
    fetch(file).then(r => r.text()).then(data => {
        document.getElementById(id).innerHTML = data;
        if(callback) callback();
    });
}

function initNavbar() {
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-menu');
    const searchInput = document.getElementById('search-input');

    if(btn) btn.addEventListener('click', () => menu.classList.toggle('active'));
    
    if(searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                window.location.href = `archive.html?search=${encodeURIComponent(searchInput.value)}`;
            }
        });
    }
}

async function fetchNews() {
    const res = await fetch('news.json');
    const data = await res.json();
    let articles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    if (path.includes('archive.html')) {
        renderArchive(articles, urlParams.get('search'));
    } else if (path.includes('uutinen.html')) {
        renderArticle(articles, urlParams.get('id'));
    } else {
        renderFrontPage(articles);
    }
}

function renderFrontPage(articles) {
    const grid = document.getElementById('front-grid');
    if(!grid) return;
    const main = articles[0];
    const smalls = articles.slice(1, 7);

    grid.innerHTML = `
        <div class="hero-news">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}" alt="">
                <h2>${main.title}</h2>
                <p style="margin-top:10px">${main.excerpt}</p>
            </a>
        </div>
        <div class="small-news-grid">
            ${smalls.map(a => `
                <div class="small-item">
                    <a href="uutinen.html?id=${a.id}">
                        <img src="${a.image}" alt="">
                        <h3>${a.title}</h3>
                    </a>
                </div>
            `).join('')}
        </div>
    `;
}

function renderArchive(articles, query) {
    const grid = document.getElementById('archive-grid');
    let results = articles;

    if(query) {
        const q = query.toLowerCase();
        results = articles.map(a => {
            let score = 0;
            if(a.title.toLowerCase().includes(q)) score = 3;
            else if(a.excerpt.toLowerCase().includes(q)) score = 2;
            else if(a.content.toLowerCase().includes(q)) score = 1;
            return {...a, score};
        }).filter(a => a.score > 0).sort((a, b) => b.score - a.score);
    }

    grid.innerHTML = results.map(a => `
        <div class="small-item">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}" alt="">
                <h3>${a.title}</h3>
            </a>
        </div>
    `).join('');
}

function renderArticle(articles, id) {
    const article = articles.find(a => a.id == id) || articles[0];
    const view = document.getElementById('article-content');
    const sidebar = document.getElementById('sidebar-latest');

    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(article.title);

    view.innerHTML = `
        <img src="${article.image}" class="feat-img" alt="">
        <h1>${article.title}</h1>
        <div class="ingress">${article.excerpt}</div>
        <div class="content">${article.content}</div>
        <div class="share-bar">
            <img src="images/facebook.png" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${shareUrl}')">
            <img src="images/x.png" onclick="window.open('https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}')">
            <img src="images/whatsapp.png" onclick="window.open('https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}')">
        </div>
        <div class="divider"></div>
        <div class="byline">
            <img src="assets/LOGO3.png" alt="">
            <span>Israel-katsaus/toimitus</span>
        </div>
    `;

    sidebar.innerHTML = articles.filter(a => a.id != article.id).slice(0, 6).map(a => `
        <div class="small-item" style="margin-bottom:20px">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}" alt="">
                <h3 style="font-size:0.9rem">${a.title}</h3>
            </a>
        </div>
    `).join('');
}
