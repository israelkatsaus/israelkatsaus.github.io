document.addEventListener('DOMContentLoaded', () => {
    // Ladataan komponentit
    loadComponent('navbar-placeholder', 'navbar.html', initNavbar);
    loadComponent('footer-placeholder', 'footer.html');

    // Haetaan uutiset
    fetch('news.json')
        .then(res => res.json())
        .then(data => {
            const articles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            initPage(articles);
        });
});

function loadComponent(id, url, callback) {
    fetch(url).then(r => r.text()).then(html => {
        document.getElementById(id).innerHTML = html;
        if(callback) callback();
    });
}

function initNavbar() {
    const btn = document.getElementById('hamburger-btn');
    const nav = document.getElementById('nav-right');
    const search = document.getElementById('search-input');

    if(btn) btn.addEventListener('click', () => nav.classList.toggle('active'));

    if(search) {
        search.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                window.location.href = `archive.html?query=${encodeURIComponent(search.value)}`;
            }
        });
    }
}

function initPage(articles) {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    const articleId = urlParams.get('id');

    if (path.includes('archive.html')) {
        renderArchive(articles, query);
    } else if (path.includes('uutinen.html')) {
        renderArticle(articles, articleId);
    } else {
        renderFrontPage(articles);
    }
}

function renderFrontPage(articles) {
    const grid = document.getElementById('front-page-grid');
    if(!grid) return;

    const main = articles[0];
    const side = articles.slice(1, 7);

    grid.innerHTML = `
        <div class="main-news-item">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}" alt="">
                <h2>${main.title}</h2>
                <p>${main.excerpt}</p>
            </a>
        </div>
        <div class="small-news-grid">
            ${side.map(a => `
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
        })
        .filter(a => a.score > 0)
        .sort((a, b) => b.score - a.score);
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
    const art = articles.find(a => a.id == id) || articles[0];
    const container = document.getElementById('full-article');
    const sidebar = document.getElementById('latest-sidebar');

    container.innerHTML = `
        <img src="${art.image}" alt="">
        <h1>${art.title}</h1>
        <div class="ingress">${art.excerpt}</div>
        <div class="article-body">${art.content}</div>
        <div class="share-links">
            <img src="images/facebook.png" onclick="share('fb')">
            <img src="images/x.png" onclick="share('x')">
            <img src="images/whatsapp.png" onclick="share('wa')">
        </div>
        <div class="separator"></div>
        <div class="toimitus-label">Israel-katsaus/toimitus</div>
    `;

    sidebar.innerHTML = articles.slice(0, 5).filter(a => a.id != art.id).map(a => `
        <div class="small-item" style="margin-bottom: 20px;">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}" alt="">
                <h3>${a.title}</h3>
            </a>
        </div>
    `).join('');
}

function share(platform) {
    const url = window.location.href;
    if(platform === 'fb') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
    if(platform === 'x') window.open(`https://twitter.com/intent/tweet?url=${url}`);
    if(platform === 'wa') window.open(`https://api.whatsapp.com/send?text=${url}`);
}
