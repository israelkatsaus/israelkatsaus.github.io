// Lataa komponentit (Navbar/Footer)
async function loadComponent(id, file, callback) {
    const resp = await fetch(file);
    const html = await resp.text();
    document.getElementById(id).innerHTML = html;
    if (callback) callback();
}

// Mobiilivalikon toiminnallisuus
function initNavbar() {
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-menu');
    btn.onclick = () => menu.classList.toggle('active');
}

// Hae uutiset JSON-tiedostosta
async function getArticles() {
    const resp = await fetch('news.json');
    const data = await resp.json();
    // Järjestetään uusimmasta vanhimpaan (ID tai Date perusteella)
    return data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Hakuominaisuus
async function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.toLowerCase();
        const articles = await getArticles();
        
        const results = articles.map(art => {
            let score = 0;
            if (art.title.toLowerCase().includes(query)) score += 3;
            if (art.excerpt.toLowerCase().includes(query)) score += 2;
            if (art.content.toLowerCase().includes(query)) score += 1;
            return { ...art, score };
        })
        .filter(art => art.score > 0)
        .sort((a, b) => b.score - a.score);

        const grid = document.getElementById('search-grid');
        const container = document.getElementById('search-results-container');
        
        if (grid && container) {
            container.style.display = 'block';
            grid.innerHTML = results.map(art => `
                <div class="news-card" onclick="location.href='uutinen.html?id=${art.id}'">
                    <img src="${art.image}">
                    <h3>${art.title}</h3>
                </div>
            `).join('');
            window.scrollTo(0, 0);
        }
    }
}

// Etusivun renderöinti
async function renderFrontPage() {
    const articles = await getArticles();
    const main = articles[0];
    const side = articles.slice(1, 7);

    document.getElementById('main-article-area').innerHTML = `
        <div class="main-article-card" onclick="location.href='uutinen.html?id=${main.id}'">
            <div class="img-container-32"><img src="${main.image}"></div>
            <h2>${main.title}</h2>
            <p>${main.excerpt}</p>
        </div>
    `;

    document.getElementById('side-articles-area').innerHTML = side.map(art => `
        <div class="side-card" onclick="location.href='uutinen.html?id=${art.id}'">
            <img src="${art.image}">
            <h4>${art.title}</h4>
        </div>
    `).join('');
}

// Arkiston renderöinti
async function renderArchive() {
    const articles = await getArticles();
    document.getElementById('archive-grid').innerHTML = articles.map(art => `
        <div class="news-card" onclick="location.href='uutinen.html?id=${art.id}'">
            <img src="${art.image}">
            <h3>${art.title}</h3>
        </div>
    `).join('');
}

// Yksittäisen uutisen renderöinti
async function renderSingleArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const articles = await getArticles();
    const article = articles.find(a => a.id == id);

    if (article) {
        const shareUrl = encodeURIComponent(window.location.href);
        const shareTitle = encodeURIComponent(article.title);

        document.getElementById('article-content').innerHTML = `
            <img src="${article.image}" class="article-hero-img">
            <h1>${article.title}</h1>
            <div class="article-ingress">${article.excerpt}</div>
            <div class="article-body">${article.content}</div>
            <div class="article-author">Israel-katsaus/toimitus</div>
            <div class="share-box">
                <p>JAA UUTINEN</p>
                <div class="share-links">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank"><img src="images/facebook.png"></a>
                    <a href="https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}" target="_blank"><img src="images/x.png"></a>
                    <a href="https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}" target="_blank"><img src="images/whatsapp.png"></a>
                </div>
                <div class="divider"></div>
            </div>
        `;
    }

    // Sivupalkki (uusimmat)
    document.getElementById('latest-sidebar').innerHTML = articles.slice(0, 8).map(art => `
        <div class="sidebar-item" onclick="location.href='uutinen.html?id=${art.id}'">
            <p>${art.title}</p>
        </div>
    `).join('');
}
