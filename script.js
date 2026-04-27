document.addEventListener('DOMContentLoaded', () => {
    // Ladataan komponentit
    loadComponent('nav-placeholder', 'navbar.html', initNavbar);
    loadComponent('footer-placeholder', 'footer.html');

    // Haetaan uutisdata
    fetch('news.json')
        .then(res => res.json())
        .then(data => {
            const articles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            initApp(articles);
        });
});

function loadComponent(id, file, callback) {
    fetch(file).then(res => res.text()).then(html => {
        document.getElementById(id).innerHTML = html;
        if(callback) callback();
    });
}

function initNavbar() {
    const ham = document.getElementById('hamburger-btn');
    const menu = document.getElementById('mobile-menu');
    const searchInputs = [document.getElementById('search-input'), document.getElementById('mobile-search-input')];

    if(ham) ham.onclick = () => menu.classList.toggle('active');

    searchInputs.forEach(input => {
        if(input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    window.location.href = `archive.html?search=${encodeURIComponent(input.value)}`;
                }
            });
        }
    });
}

function initApp(articles) {
    const urlParams = new URLSearchParams(window.location.search);
    const searchWord = urlParams.get('search');
    const articleId = urlParams.get('id');

    if (window.location.pathname.includes('archive.html')) {
        renderArchive(articles, searchWord);
    } else if (window.location.pathname.includes('uutinen.html')) {
        renderArticle(articles, articleId);
    } else {
        renderFrontPage(articles);
    }
}

function renderFrontPage(articles) {
    const grid = document.getElementById('front-grid');
    if(!grid) return;
    
    const main = articles[0];
    const side = articles.slice(1, 7);

    grid.innerHTML = `
        <div class="main-news-item">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}" alt="">
                <h2>${main.title}</h2>
                <p style="margin-top:10px">${main.excerpt}</p>
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
    if(!grid) return;

    let results = articles;
    if(query) {
        const q = query.toLowerCase();
        results = articles.map(a => {
            let score = 0;
            if (a.title.toLowerCase().includes(q)) score = 3;
            else if (a.excerpt.toLowerCase().includes(q)) score = 2;
            else if (a.content.toLowerCase().includes(q)) score = 1;
            return { ...a, score };
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
    const art = articles.find(a => a.id == id) || articles[0];
    const container = document.getElementById('article-view');
    const sidebar = document.getElementById('latest-sidebar');

    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(art.title);

    if(container) {
        container.className = "article-view article-layout";
        container.innerHTML = `
            <div class="main-article">
                <img src="${art.image}" alt="">
                <h1>${art.title}</h1>
                <div class="ingress">${art.excerpt}</div>
                <div class="article-content">${art.content}</div>
                <p class="toimitus-text">Israel-katsaus/toimitus</p>
                <div class="share-links">
                    <img src="images/facebook.png" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${shareUrl}')">
                    <img src="images/x.png" onclick="window.open('https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}')">
                    <img src="images/whatsapp.png" onclick="window.open('https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}')">
                </div>
                <div class="share-divider"></div>
            </div>
            <div class="sidebar">
                ${articles.slice(0, 6).map(a => `
                    <div class="small-item" style="margin-bottom:20px">
                        <a href="uutinen.html?id=${a.id}">
                            <img src="${a.image}" alt="">
                            <h3 style="font-size:0.85rem">${a.title}</h3>
                        </a>
                    </div>
                `).join('')}
            </div>
        `;
    }
}
