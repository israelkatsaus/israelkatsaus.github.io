document.addEventListener('DOMContentLoaded', () => {
    // Ladataan Navbar ja Footer dynaamisesti
    loadComponent('navbar-placeholder', 'navbar.html', initNavbar);
    loadComponent('footer-placeholder', 'footer.html');
    
    // Ladataan uutiset
    fetch('news.json')
        .then(response => response.json())
        .then(data => {
            const articles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            handleRouting(articles);
        });
});

function loadComponent(id, file, callback) {
    fetch(file).then(r => r.text()).then(html => {
        document.getElementById(id).innerHTML = html;
        if(callback) callback();
    });
}

function initNavbar() {
    const ham = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-links-container');
    const desktopSearch = document.getElementById('search-input-desktop');
    const mobileSearch = document.getElementById('search-input-mobile');

    ham.addEventListener('click', () => {
        menu.classList.toggle('active');
        ham.classList.toggle('open');
    });

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            window.location.href = `archive.html?query=${encodeURIComponent(e.target.value)}`;
        }
    };

    if(desktopSearch) desktopSearch.addEventListener('keypress', handleSearch);
    if(mobileSearch) mobileSearch.addEventListener('keypress', handleSearch);
}

function handleRouting(articles) {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    
    if (path.includes('archive.html')) {
        renderArchive(articles, urlParams.get('query'));
    } else if (path.includes('uutinen.html')) {
        renderSingleArticle(articles, urlParams.get('id'));
    } else {
        renderFrontPage(articles);
    }
}

function renderFrontPage(articles) {
    const container = document.getElementById('hero-grid');
    if (!container) return;

    const main = articles[0];
    const side = articles.slice(1, 7);

    let html = `
        <div class="main-news">
            <a href="uutinen.html?id=${main.id}">
                <div class="main-news-image-wrapper">
                    <img src="${main.image}" alt="">
                </div>
                <h2>${main.title}</h2>
                <p style="margin-top:10px">${main.excerpt}</p>
            </a>
        </div>
        <div class="small-news-grid">
            ${side.map(a => `
                <div class="small-news-item">
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
    if (!grid) return;

    let filtered = articles;
    if (query) {
        const q = query.toLowerCase();
        filtered = articles.map(a => {
            let score = 0;
            if (a.title.toLowerCase().includes(q)) score = 3;
            else if (a.excerpt.toLowerCase().includes(q)) score = 2;
            else if (a.content.toLowerCase().includes(q)) score = 1;
            return { ...a, score };
        })
        .filter(a => a.score > 0)
        .sort((a, b) => b.score - a.score);
        document.querySelector('.page-title').innerText = `Haun tulokset: "${query}"`;
    }

    grid.innerHTML = filtered.map(a => `
        <div class="small-news-item">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}" alt="">
                <h3>${a.title}</h3>
            </a>
        </div>
    `).join('');
}

function renderSingleArticle(articles, id) {
    const article = articles.find(a => a.id == id) || articles[0];
    const contentDiv = document.getElementById('article-content');
    const sidebar = document.getElementById('sidebar-latest');

    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(article.title);

    contentDiv.innerHTML = `
        <img src="${article.image}" alt="">
        <h1>${article.title}</h1>
        <div class="excerpt">${article.excerpt}</div>
        <div class="content-area">${article.content}</div>
        <div class="share-links">
            <img src="images/facebook.png" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${shareUrl}')">
            <img src="images/x.png" onclick="window.open('https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}')">
            <img src="images/whatsapp.png" onclick="window.open('https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}')">
        </div>
        <div class="divider"></div>
        <div class="article-footer-brand">
            <img src="assets/LOGO3.png" alt="">
            <span>Israel-katsaus</span>
        </div>
    `;

    // Sivupalkkiin 6 uusinta uutista (paitsi nykyinen)
    const latest = articles.filter(a => a.id != article.id).slice(0, 6);
    sidebar.innerHTML = latest.map(a => `
        <div class="small-news-item" style="margin-bottom:25px">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}" alt="">
                <h3 style="font-size:0.9rem">${a.title}</h3>
            </a>
        </div>
    `).join('');
}
