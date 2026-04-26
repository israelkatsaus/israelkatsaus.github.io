document.addEventListener('DOMContentLoaded', () => {
    // Lataa Navbar ja Footer
    loadComponent('navbar-placeholder', 'navbar.html', initNavbar);
    loadComponent('footer-placeholder', 'footer.html');

    // Lataa uutiset
    fetch('news.json')
        .then(res => res.json())
        .then(data => {
            const articles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            route(articles);
        });
});

function loadComponent(id, file, callback) {
    fetch(file)
        .then(res => res.text())
        .then(html => {
            document.getElementById(id).innerHTML = html;
            if (callback) callback();
        });
}

function initNavbar() {
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-menu');
    const searchInput = document.getElementById('search-input');

    if (btn) btn.addEventListener('click', () => menu.classList.toggle('active'));

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.location.href = `archive.html?search=${searchInput.value}`;
            }
        });
    }
}

function route(articles) {
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
    const grid = document.getElementById('front-page-grid');
    if (!grid) return;

    const main = articles[0];
    const smallOnes = articles.slice(1, 5);

    let html = `
        <div class="main-news news-card">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}" alt="">
                <h2>${main.title}</h2>
                <p>${main.excerpt}</p>
            </a>
        </div>
        <div class="small-news-grid">
    `;

    smallOnes.forEach(art => {
        html += `
            <div class="news-card">
                <a href="uutinen.html?id=${art.id}">
                    <img src="${art.image}" alt="">
                    <h3>${art.title}</h3>
                </a>
            </div>
        `;
    });

    html += `</div>`;
    grid.innerHTML = html;
}

function renderArchive(articles, query) {
    const grid = document.getElementById('archive-grid');
    if (!grid) return;

    let filtered = articles;

    if (query) {
        const q = query.toLowerCase();
        // Haku tärkeysjärjestyksessä: 1. Otsikko, 2. Ingressi, 3. Leipäteksti
        filtered = articles.map(art => {
            let score = 0;
            if (art.title.toLowerCase().includes(q)) score = 3;
            else if (art.excerpt.toLowerCase().includes(q)) score = 2;
            else if (art.content.toLowerCase().includes(q)) score = 1;
            return { ...art, score };
        })
        .filter(art => art.score > 0)
        .sort((a, b) => b.score - a.score);
    }

    grid.innerHTML = filtered.map(art => `
        <div class="news-card">
            <a href="uutinen.html?id=${art.id}">
                <img src="${art.image}" alt="">
                <h3>${art.title}</h3>
            </a>
        </div>
    `).join('');
}

function renderArticle(articles, id) {
    const article = articles.find(a => a.id == id) || articles[0];
    const view = document.getElementById('article-view');
    const sidebar = document.getElementById('sidebar-news');

    if (view) {
        view.innerHTML = `
            <div class="article-view">
                <h1>${article.title}</h1>
                <div class="excerpt">${article.excerpt}</div>
                <img src="${article.image}" class="featured-img" alt="">
                <div class="article-body">${article.content}</div>
                
                <div class="share-links">
                    <a href="#"><img src="images/facebook.png" alt="FB"></a>
                    <a href="#"><img src="images/x.png" alt="X"></a>
                    <a href="#"><img src="images/whatsapp.png" alt="WA"></a>
                </div>
                <div class="divider"></div>
                <div class="author-info">
                    <img src="assets/LOGO3.png" alt="">
                    <strong>Israel-katsaus</strong>
                </div>
            </div>
        `;
    }

    if (sidebar) {
        const latest = articles.filter(a => a.id != article.id).slice(0, 5);
        sidebar.innerHTML = latest.map(art => `
            <div class="news-card" style="margin-bottom: 20px;">
                <a href="uutinen.html?id=${art.id}">
                    <img src="${art.image}" alt="">
                    <h3 style="font-size: 0.9rem;">${art.title}</h3>
                </a>
            </div>
        `).join('');
    }
}
