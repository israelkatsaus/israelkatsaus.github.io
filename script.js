// Lataa navbar ja footer kaikille sivuille
function loadLayout(callback) {
    fetch('navbar.html').then(r => r.text()).then(html => {
        document.getElementById('navbar-placeholder').innerHTML = html;
    });
    fetch('footer.html').then(r => r.text()).then(html => {
        document.getElementById('footer-placeholder').innerHTML = html;
        if(callback) callback();
    });
}

// Hakutoiminto Enterillä
function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.toLowerCase();
        window.location.href = `archive.html?search=${encodeURIComponent(query)}`;
    }
}

async function getArticles() {
    const response = await fetch('news.json');
    const data = await response.json();
    return data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Etusivun rakentaminen
async function renderFrontPage() {
    const articles = await getArticles();
    const container = document.getElementById('front-page-layout');
    
    const main = articles[0];
    const subs = articles.slice(1, 5);

    container.innerHTML = `
        <div class="main-news">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}">
                <h2>${main.title}</h2>
                <p>${main.excerpt}</p>
            </a>
        </div>
        <div class="sub-news-grid">
            ${subs.map(a => `
                <div class="sub-card">
                    <a href="uutinen.html?id=${a.id}">
                        <img src="${a.image}">
                        <h3>${a.title}</h3>
                    </a>
                </div>
            `).join('')}
        </div>
    `;
}

// Arkiston rakentaminen (sisältää hakutulokset)
async function renderArchive() {
    const articles = await getArticles();
    const grid = document.getElementById('archive-grid');
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    let filtered = articles;
    if (searchQuery) {
        document.getElementById('archive-title').innerText = `Hakutulokset: "${searchQuery}"`;
        filtered = articles.filter(a => {
            if (a.title.toLowerCase().includes(searchQuery)) return true; // 1. Otsikko
            if (a.excerpt.toLowerCase().includes(searchQuery)) return true; // 2. Ingressi
            if (a.content.toLowerCase().includes(searchQuery)) return true; // 3. Leipäteksti
            return false;
        });
    }

    grid.innerHTML = filtered.map(a => `
        <div class="archive-card">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}">
                <h3>${a.title}</h3>
            </a>
        </div>
    `).join('');
}

// Artikkelisivun rakentaminen
async function renderArticle() {
    const articles = await getArticles();
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    const article = articles.find(a => a.id === id);

    if (!article) return;

    const content = document.getElementById('article-content');
    content.innerHTML = `
        <img src="${article.image}">
        <h1>${article.title}</h1>
        <p><strong>${article.excerpt}</strong></p>
        <div class="article-body">${article.content}</div>
        <div class="share-links">
            <img src="images/facebook.png">
            <img src="images/x.png">
            <img src="images/whatsapp.png">
        </div>
        <hr class="share-divider">
        <div class="brand-footer">
            <img src="assets/LOGO3.png">
            <span>Israel-katsaus</span>
        </div>
    `;

    const sidebar = document.getElementById('sidebar-list');
    const latest = articles.filter(a => a.id !== id).slice(0, 5);
    sidebar.innerHTML = latest.map(a => `
        <div class="sub-card" style="margin-bottom: 20px;">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}">
                <h4>${a.title}</h4>
            </a>
        </div>
    `).join('');
}
