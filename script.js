// Funktio HTML-komponenttien lataamiseen (navbar ja footer)
async function loadComponent(id, file) {
    const response = await fetch(file);
    const text = await response.text();
    document.getElementById(id).innerHTML = text;
}

// Uutisten haku JSON-tiedostosta
async function fetchNews() {
    try {
        const response = await fetch('news.json');
        const data = await response.json();
        // Lajitellaan uusimmasta vanhimpaan (date-kentän mukaan)
        return data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error("Virhe ladattaessa uutisia:", error);
        return [];
    }
}

// Etusivun renderöinti
async function renderFrontPage() {
    const articles = await fetchNews();
    const container = document.getElementById('featured-news-container');
    if (!container) return;

    if (articles.length === 0) return;

    const lead = articles[0];
    const others = articles.slice(1, 7);

    let html = `
        <div class="main-feature">
            <a href="uutinen.html?id=${lead.id}">
                <div class="news-card">
                    <img src="${lead.image}" alt="">
                    <h2>${lead.title}</h2>
                    <p>${lead.excerpt}</p>
                </div>
            </a>
        </div>
        <div class="side-grid">
    `;

    others.forEach(art => {
        html += `
            <a href="uutinen.html?id=${art.id}">
                <div class="news-card">
                    <img src="${art.image}" alt="">
                    <h3>${art.title}</h3>
                </div>
            </a>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// Arkiston renderöinti
async function renderArchive() {
    const articles = await fetchNews();
    const grid = document.getElementById('archive-grid');
    if (!grid) return;

    grid.innerHTML = articles.map(art => `
        <a href="uutinen.html?id=${art.id}">
            <div class="news-card">
                <img src="${art.image}" alt="">
                <h3>${art.title}</h3>
                <p style="font-size: 0.8rem; padding: 0 10px;">${art.date}</p>
            </div>
        </a>
    `).join('');
}

// Yksittäisen uutisen renderöinti
async function renderSingleArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const articles = await fetchNews();
    const article = articles.find(a => a.id == id);
    
    if (!article) return;

    const contentDiv = document.getElementById('article-content');
    contentDiv.innerHTML = `
        <h1>${article.title}</h1>
        <img src="${article.image}" class="article-header-img">
        <div class="excerpt">${article.excerpt}</div>
        <div class="content">${article.content}</div>
        
        <div class="share-links">
            <a href="#"><img src="images/facebook.png"></a>
            <a href="#"><img src="images/x.png"></a>
            <a href="#"><img src="images/whatsapp.png"></a>
        </div>
        <hr class="share-divider">
        <div class="author-info">
            <img src="assets/LOGO3.png" style="height:30px;">
            <span>Israel-katsaus</span>
        </div>
    `;

    // Sivupalkin uusimmat
    const sidebar = document.getElementById('latest-news-sidebar');
    const latest = articles.slice(0, 5);
    sidebar.innerHTML = latest.map(art => `
        <a href="uutinen.html?id=${art.id}">
            <div style="margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                <h4 style="font-size: 0.9rem;">${art.title}</h4>
            </div>
        </a>
    `).join('');
}

// Hakutoiminto
async function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.toLowerCase();
        const articles = await fetchNews();
        
        // Hakulogiikka tärkeysjärjestyksessä: Otsikko > Ingressi > Teksti
        const results = articles.map(art => {
            let score = 0;
            if (art.title.toLowerCase().includes(query)) score += 100;
            if (art.excerpt.toLowerCase().includes(query)) score += 50;
            if (art.content.toLowerCase().includes(query)) score += 10;
            return { ...art, score };
        })
        .filter(art => art.score > 0)
        .sort((a, b) => b.score - a.score);

        // Näytetään tulokset arkistonäkymässä (yksinkertaisuuden vuoksi)
        const grid = document.getElementById('archive-grid') || document.getElementById('featured-news-container');
        if (grid) {
            grid.innerHTML = `<h2>Hakutulokset: "${query}"</h2><div class="archive-grid">` + 
            results.map(art => `
                <a href="uutinen.html?id=${art.id}">
                    <div class="news-card">
                        <img src="${art.image}" alt="">
                        <h3>${art.title}</h3>
                    </div>
                </a>
            `).join('') + `</div>`;
        }
    }
}

// Mobiilivalikon toggle
function toggleMenu() {
    const links = document.getElementById('navLinks');
    links.classList.toggle('active');
}
