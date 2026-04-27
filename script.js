document.addEventListener('DOMContentLoaded', () => {
    // Ladataan komponentit
    Promise.all([
        fetch('navbar.html').then(r => r.text()),
        fetch('footer.html').then(r => r.text())
    ]).then(([navHtml, footHtml]) => {
        document.getElementById('nav-placeholder').innerHTML = navHtml;
        document.getElementById('footer-placeholder').innerHTML = footHtml;
        initNav();
    });

    // Haetaan uutiset
    fetch('news.json')
        .then(r => r.json())
        .then(data => {
            const articles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            renderPage(articles);
        });
});

function initNav() {
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('mobile-menu');
    if(toggle) toggle.onclick = () => menu.classList.toggle('active');

    const handleSearch = (e) => {
        if(e.key === 'Enter') {
            window.location.href = `archive.html?search=${encodeURIComponent(e.target.value)}`;
        }
    };

    document.getElementById('search-input')?.addEventListener('keypress', handleSearch);
    document.getElementById('mobile-search-input')?.addEventListener('keypress', handleSearch);
}

function renderPage(articles) {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    if (path.includes('archive.html')) {
        renderArchive(articles, params.get('search'));
    } else if (path.includes('uutinen.html')) {
        renderArticle(articles, params.get('id'));
    } else {
        renderFrontPage(articles);
    }
}

function renderFrontPage(articles) {
    const container = document.getElementById('hero-section');
    if(!container) return;

    const main = articles[0];
    const side = articles.slice(1, 7);

    container.innerHTML = `
        <div class="main-story">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}" alt="">
                <h2>${main.title}</h2>
                <p style="margin-top:12px">${main.excerpt}</p>
            </a>
        </div>
        <div class="side-grid">
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
    if(!grid) return;

    let filtered = articles;
    if(query) {
        const q = query.toLowerCase();
        filtered = articles.map(a => {
            let score = 0;
            if(a.title.toLowerCase().includes(q)) score = 3;
            else if(a.excerpt.toLowerCase().includes(q)) score = 2;
            else if(a.content.toLowerCase().includes(q)) score = 1;
            return {...a, score};
        }).filter(a => a.score > 0).sort((a,b) => b.score - a.score);
        document.getElementById('archive-title').innerText = `TULOKSET: ${query.toUpperCase()}`;
    }

    grid.innerHTML = filtered.map(a => `
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
    const container = document.getElementById('article-container');
    const sidebar = document.getElementById('sidebar-news');
    
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(art.title);

    container.innerHTML = `
        <img src="${art.image}" alt="">
        <h1>${art.title}</h1>
        <div class="ingress">${art.excerpt}</div>
        <div class="content-body">${art.content}</div>
        <div class="article-meta-line">
            <span class="toimitus-text">Israel-katsaus/toimitus</span>
            <div class="share-links">
                <img src="images/facebook.png" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${url}')">
                <img src="images/x.png" onclick="window.open('https://twitter.com/intent/tweet?url=${url}&text=${title}')">
                <img src="images/whatsapp.png" onclick="window.open('https://api.whatsapp.com/send?text=${title}%20${url}')">
            </div>
        </div>
        <div class="hr-small"></div>
    `;

    sidebar.innerHTML = articles.slice(0, 6).filter(a => a.id != art.id).map(a => `
        <div class="small-card" style="margin-bottom: 25px">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}" alt="">
                <h3>${a.title}</h3>
            </a>
        </div>
    `).join('');
}
