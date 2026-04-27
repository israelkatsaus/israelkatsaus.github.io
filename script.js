document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar-placeholder', 'navbar.html', initNavbar);
    loadComponent('footer-placeholder', 'footer.html');
    
    fetch('news.json')
        .then(res => res.json())
        .then(data => {
            const articles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            initApp(articles);
        });
});

function loadComponent(id, file, callback) {
    fetch(file).then(r => r.text()).then(html => {
        document.getElementById(id).innerHTML = html;
        if(callback) callback();
    });
}

function initNavbar() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('nav-right-menu');
    const searchInput = document.getElementById('search-input');

    if(btn) btn.onclick = () => menu.classList.toggle('active');

    searchInput.onkeypress = (e) => {
        if(e.key === 'Enter') {
            window.location.href = `archive.html?search=${encodeURIComponent(searchInput.value)}`;
        }
    };
}

function initApp(articles) {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path.includes('archive.html')) {
        renderArchive(articles, params.get('search'));
    } else if (path.includes('uutinen.html')) {
        renderArticle(articles, params.get('id'));
    } else {
        renderFrontPage(articles);
    }
}

function renderFrontPage(articles) {
    const container = document.getElementById('hero-grid');
    if(!container) return;

    const main = articles[0];
    const side = articles.slice(1, 7);

    container.innerHTML = `
        <div class="main-news-item">
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
        }).filter(a => a.score > 0).sort((a, b) => b.score - a.score);
        document.getElementById('archive-header').innerText = `Haun tulokset: "${query}"`;
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
    const view = document.getElementById('article-view');
    const sidebar = document.getElementById('sidebar-latest');
    
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(art.title);

    view.innerHTML = `
        <img src="${art.image}" alt="">
        <h1>${art.title}</h1>
        <div class="ingress">${art.excerpt}</div>
        <div class="content">${art.content}</div>
        <div class="share-links">
            <img src="images/facebook.png" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${url}')">
            <img src="images/x.png" onclick="window.open('https://twitter.com/intent/tweet?url=${url}&text=${title}')">
            <img src="images/whatsapp.png" onclick="window.open('https://api.whatsapp.com/send?text=${title}%20${url}')">
        </div>
        <div class="divider"></div>
        <div class="author-line">
            <img src="assets/LOGO3.png" alt="">
            <span>Israel-katsaus/toimitus</span>
        </div>
    `;

    // Sivupalkki (uusimmat uutiset ilman otsikkoa)
    const latest = articles.filter(a => a.id != art.id).slice(0, 6);
    sidebar.innerHTML = latest.map(a => `
        <div class="small-card" style="margin-bottom:25px">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}" alt="">
                <h3 style="font-size:0.9rem">${a.title}</h3>
            </a>
        </div>
    `).join('');
}
