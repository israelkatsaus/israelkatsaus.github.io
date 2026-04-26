document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar-placeholder', 'navbar.html', initNavbar);
    loadComponent('footer-placeholder', 'footer.html');
    loadArticles();
});

function loadComponent(id, file, callback) {
    fetch(file).then(r => r.text()).then(data => {
        document.getElementById(id).innerHTML = data;
        if(callback) callback();
    });
}

function initNavbar() {
    const ham = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-menu');
    const searchTrigger = document.getElementById('search-trigger');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');

    if(ham) ham.onclick = () => menu.classList.toggle('active');
    
    if(searchTrigger) {
        searchTrigger.onclick = () => {
            searchContainer.classList.toggle('active');
            if(searchContainer.classList.contains('active')) searchInput.focus();
        };
    }

    searchInput.onkeypress = (e) => {
        if(e.key === 'Enter') {
            window.location.href = `archive.html?haku=${encodeURIComponent(searchInput.value)}`;
        }
    };
}

async function loadArticles() {
    const res = await fetch('news.json');
    const data = await res.json();
    let articles = data.articles;
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path.includes('archive.html')) {
        renderArchive(articles, params.get('haku'));
    } else if (path.includes('uutinen.html')) {
        renderArticle(articles, params.get('id'));
    } else {
        renderFront(articles);
    }
}

function renderFront(articles) {
    const container = document.getElementById('front-page-content');
    if(!container) return;
    const main = articles[0];
    const smalls = articles.slice(1, 7);

    container.innerHTML = `
        <div class="main-news">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}" alt="">
                <h2>${main.title}</h2>
                <p>${main.excerpt}</p>
            </a>
        </div>
        <div class="small-news-side">
            ${smalls.map(a => `
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

    if(query) {
        const q = query.toLowerCase();
        results = articles.map(a => {
            let score = 0;
            if(a.title.toLowerCase().includes(q)) score = 3;
            else if(a.excerpt.toLowerCase().includes(q)) score = 2;
            else if(a.content.toLowerCase().includes(q)) score = 1;
            return {...a, score};
        }).filter(a => a.score > 0).sort((a, b) => b.score - a.score);
        document.getElementById('archive-title').innerText = `Hakutulokset: ${query}`;
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
    const view = document.getElementById('article-view');
    const sidebar = document.getElementById('sidebar-news');

    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(art.title);

    view.innerHTML = `
        <img src="${art.image}" class="main-img" alt="">
        <h1>${art.title}</h1>
        <p class="excerpt">${art.excerpt}</p>
        <div class="article-content">${art.content}</div>
        <div class="share-links">
            <img src="images/facebook.png" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${url}')">
            <img src="images/x.png" onclick="window.open('https://twitter.com/intent/tweet?url=${url}&text=${text}')">
            <img src="images/whatsapp.png" onclick="window.open('https://api.whatsapp.com/send?text=${text}%20${url}')">
        </div>
        <div class="jakoviiva"></div>
        <div class="author-info">
            <img src="assets/LOGO3.png" alt="">
            <span>Israel-katsaus</span>
        </div>
    `;

    sidebar.innerHTML = articles.filter(a => a.id != art.id).slice(0, 5).map(a => `
        <div class="small-card">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}" alt="">
                <h3>${a.title}</h3>
            </a>
        </div>
    `).join('');
}
