// Apufunktio komponenttien lataamiseen (Navbar & Footer)
async function loadComponent(id, file, callback) {
    const resp = await fetch(file);
    const html = await resp.text();
    document.getElementById(id).innerHTML = html;
    if (callback) callback();
}

// Uutisten haku ja järjestäminen
async function getNews() {
    const resp = await fetch('news.json');
    const data = await resp.json();
    // Järjestetään uusimmasta alkaen
    return data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Hakutoiminnallisuus
function initSearch() {
    const input = document.getElementById('search-input');
    const dropdown = document.getElementById('search-results');

    input.addEventListener('input', async (e) => {
        const val = e.target.value.toLowerCase();
        if (val.length < 2) {
            dropdown.style.display = 'none';
            return;
        }

        const articles = await getNews();
        
        // Tärkeysjärjestys: 1. Title, 2. Excerpt, 3. Content
        const results = articles.filter(a => {
            return a.title.toLowerCase().includes(val) || 
                   a.excerpt.toLowerCase().includes(val) || 
                   a.content.toLowerCase().includes(val);
        }).sort((a, b) => {
            if (a.title.toLowerCase().includes(val) && !b.title.toLowerCase().includes(val)) return -1;
            if (!a.title.toLowerCase().includes(val) && b.title.toLowerCase().includes(val)) return 1;
            return 0;
        });

        if (results.length > 0) {
            dropdown.innerHTML = results.slice(0, 5).map(a => `
                <a href="uutinen.html?id=${a.id}" class="search-item">
                    <div style="padding:10px; border-bottom:1px solid #eee;">
                        <strong>${a.title}</strong><br>
                        <small>${a.date}</small>
                    </div>
                </a>
            `).join('');
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    });
}

// Etusivun renderöinti
async function renderFrontPage() {
    const articles = await getNews();
    const grid = document.getElementById('front-page-grid');
    
    const main = articles[0];
    const subArticles = articles.slice(1, 5);

    grid.innerHTML = `
        <div class="main-news-card card">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}" alt="Pääuutinen">
                <h2>${main.title}</h2>
                <p>${main.excerpt}</p>
            </a>
        </div>
        <div class="sub-news-grid">
            ${subArticles.map(a => `
                <div class="card">
                    <a href="uutinen.html?id=${a.id}">
                        <img src="${a.image}" alt="Uutinen">
                        <h3>${a.title}</h3>
                    </a>
                </div>
            `).join('')}
        </div>
    `;
}

// Artikkelisivun renderöinti
async function renderSingleArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const articles = await getNews();
    const article = articles.find(a => a.id === id) || articles[0];

    document.title = `${article.title} - Israel-katsaus`;

    const mainArea = document.getElementById('full-article');
    mainArea.innerHTML = `
        <img src="${article.image}" alt="Uutisen kuva">
        <h1>${article.title}</h1>
        <div class="article-content-body">
            ${article.content}
        </div>
        <div class="social-share">
            <img src="images/facebook.png" alt="FB">
            <img src="images/x.png" alt="X">
            <img src="images/whatsapp.png" alt="WA">
        </div>
        <hr class="share-divider">
        <div class="brand-footer">
            <img src="assets/LOGO3.png" alt="Mini logo">
            <strong>Israel-katsaus</strong>
        </div>
    `;

    // Sivupalkki (uusimmat uutiset)
    const sidebar = document.getElementById('latest-sidebar');
    const latest = articles.filter(a => a.id !== article.id).slice(0, 5);
    sidebar.innerHTML = latest.map(a => `
        <div class="card" style="margin-bottom: 20px;">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}">
                <h4 style="margin:5px 0;">${a.title}</h4>
            </a>
        </div>
    `).join('');
}

// Arkiston renderöinti
async function renderArchive() {
    const articles = await getNews();
    const container = document.getElementById('archive-container');
    
    container.innerHTML = articles.map(a => `
        <div class="archive-item card" style="display:flex; gap:20px; margin-bottom:20px; align-items:center;">
            <img src="${a.image}" style="width:150px; aspect-ratio:16/9; object-fit:cover;">
            <div>
                <small>${a.date}</small>
                <h3><a href="uutinen.html?id=${a.id}">${a.title}</a></h3>
                <p>${a.excerpt}</p>
            </div>
        </div>
    `).join('');
}
