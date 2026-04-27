document.addEventListener('DOMContentLoaded', () => {
    // Lataa Navbar ja Footer
    Promise.all([
        fetch('navbar.html').then(r => r.text()),
        fetch('footer.html').then(r => r.text())
    ]).then(([nav, foot]) => {
        document.getElementById('navbar-placeholder').innerHTML = nav;
        document.getElementById('footer-placeholder').innerHTML = foot;
        initNavLogic();
    });

    // Lataa Uutiset
    fetch('news.json')
        .then(res => res.json())
        .then(data => {
            const articles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            initRouter(articles);
        });
});

function initNavLogic() {
    const btn = document.getElementById('hamburger-btn');
    const overlay = document.getElementById('mobile-overlay');
    if (btn) btn.addEventListener('click', () => overlay.classList.toggle('active'));

    const searchAction = (e) => {
        if (e.key === 'Enter') {
            window.location.href = `archive.html?q=${encodeURIComponent(e.target.value)}`;
        }
    };
    
    document.getElementById('site-search')?.addEventListener('keypress', searchAction);
    document.getElementById('mobile-search-input')?.addEventListener('keypress', searchAction);
}

function initRouter(articles) {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    if (path.includes('archive.html')) {
        renderArchive(articles, params.get('q'));
    } else if (path.includes('uutinen.html')) {
        renderArticle(articles, params.get('id'));
    } else {
        renderFrontPage(articles);
    }
}

function renderFrontPage(articles) {
    const grid = document.getElementById('front-grid');
    if (!grid) return;
    const main = articles[0];
    const side = articles.slice(1, 7);

    grid.innerHTML = `
        <div class="main-story">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}" alt="">
                <h2>${main.title}</h2>
                <p style="margin-top:10px">${main.excerpt}</p>
            </a>
        </div>
        <div class="side-news-grid">
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
}

function renderArchive(articles, query) {
    const grid = document.getElementById('archive-grid');
    let results = articles;

    if (query) {
        const q = query.toLowerCase();
        results = articles.map(a => {
            let score = 0;
            if (a.title.toLowerCase().includes(q)) score = 3;
            else if (a.excerpt.toLowerCase().includes(q)) score = 2;
            else if (a.content.toLowerCase().includes(q)) score = 1;
            return { ...a, score };
        }).filter(a => a.score > 0).sort((a, b) => b.score - a.score);
        document.getElementById('page-heading').innerText = `HAKUTULOKSET: ${query.toUpperCase()}`;
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
    const art = articles.find(a => a.id == id) || articles[0];
    const latest = articles.filter(a => a.id != art.id).slice(0, 6);
    const container = document.getElementById('article-content');
    const sidebar = document.getElementById('sidebar-news');
    
    const shareUrl = encodeURIComponent(window.location.href);

    container.innerHTML = `
        <img src="${art.image}" alt="">
        <h1>${art.title}</h1>
        <div class="ingress">${art.excerpt}</div>
        <div class="body-text">${art.content}</div>
        <div class="article-footer">
            <div class="toimitus-label">Israel-katsaus/toimitus</div>
            <div class="share-links">
                <img src="images/facebook.png" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${shareUrl}')">
                <img src="images/x.png" onclick="window.open('https://twitter.com/intent/tweet?url=${shareUrl}')">
                <img src="images/whatsapp.png" onclick="window.open('https://api.whatsapp.com/send?text=${shareUrl}')">
            </div>
        </div>
        <div class="divider-line"></div>
    `;

    sidebar.innerHTML = latest.map(a => `
        <div class="small-card">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}" alt="">
                <h3>${a.title}</h3>
            </a>
        </div>
    `).join('');
}
