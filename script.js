// Apuohjelma HTML-palasten lataamiseen
async function loadLayout() {
    const nav = await fetch('navbar.html').then(res => res.text());
    const foot = await fetch('footer.html').then(res => res.text());
    document.getElementById('navbar-placeholder').innerHTML = nav;
    document.getElementById('footer-placeholder').innerHTML = foot;
}

function toggleMenu() {
    document.getElementById('nav-links').classList.toggle('active');
}

// Uutisten haku
async function fetchArticles() {
    const response = await fetch('news.json');
    const data = await response.json();
    // Järjestetään päivämäärän mukaan uusimmasta vanhimpaan
    return data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Etusivun lataus
async function loadFrontPage() {
    const articles = await fetchArticles();
    if (articles.length === 0) return;

    const main = articles[0];
    const side = articles.slice(1, 7);

    const mainDiv = document.getElementById('main-article');
    mainDiv.innerHTML = `
        <article class="main-card" onclick="window.location.href='uutinen.html?id=${main.id}'">
            <div class="image-3-2">
                <img src="${main.image}" alt="">
            </div>
            <h2>${main.title}</h2>
            <p>${main.excerpt}</p>
        </article>
    `;

    const sideDiv = document.getElementById('side-articles');
    sideDiv.innerHTML = side.map(art => `
        <article class="side-card" onclick="window.location.href='uutinen.html?id=${art.id}'">
            <img src="${art.image}" alt="">
            <h4>${art.title}</h4>
        </article>
    `).join('');
}

// Arkiston lataus
async function loadArchive() {
    const articles = await fetchArticles();
    const container = document.getElementById('archive-list');
    container.innerHTML = articles.map(art => `
        <article class="archive-card" onclick="window.location.href='uutinen.html?id=${art.id}'">
            <img src="${art.image}" alt="">
            <h3>${art.title}</h3>
            <p>${art.date}</p>
        </article>
    `).join('');
}

// Yksittäisen uutisen lataus
async function loadSingleArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const articles = await fetchArticles();
    const article = articles.find(a => a.id === id);

    if (article) {
        document.title = `${article.title} - Israel-katsaus`;
        const container = document.getElementById('article-content');
        const shareUrl = encodeURIComponent(window.location.href);
        const shareText = encodeURIComponent(article.title);

        container.innerHTML = `
            <img src="${article.image}" class="full-article-img">
            <h1 class="article-title">${article.title}</h1>
            <div class="ingress">${article.excerpt}</div>
            <div class="content-body">${article.content}</div>
            <div class="credits">Israel-katsaus/toimitus</div>
            <div class="share-section">
                <p>JAA UUTINEN</p>
                <div class="share-icons">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank"><img src="images/facebook.png"></a>
                    <a href="https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}" target="_blank"><img src="images/x.png"></a>
                    <a href="https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}" target="_blank"><img src="images/whatsapp.png"></a>
                </div>
                <hr class="share-divider">
            </div>
        `;
    }

    // Uusimmat sivuun
    const sidebar = document.getElementById('sidebar-latest');
    sidebar.innerHTML = articles.slice(0, 5).map(art => `
        <div class="sidebar-item" onclick="window.location.href='uutinen.html?id=${art.id}'">
            <p>${art.title}</p>
        </div>
    `).join('');
}

// Hakutoiminnallisuus
async function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.toLowerCase();
        const articles = await fetchArticles();
        
        // Pisteytys tärkeysjärjestyksen mukaan
        const results = articles.map(art => {
            let score = 0;
            if (art.title.toLowerCase().includes(query)) score += 3;
            if (art.excerpt.toLowerCase().includes(query)) score += 2;
            if (art.content.toLowerCase().includes(query)) score += 1;
            return { ...art, score };
        })
        .filter(art => art.score > 0)
        .sort((a, b) => b.score - a.score);

        displaySearchResults(results);
    }
}

function displaySearchResults(results) {
    const front = document.getElementById('front-page-layout');
    const searchDiv = document.getElementById('search-results');
    const grid = document.getElementById('search-grid');

    if (front) front.style.display = 'none';
    searchDiv.style.display = 'block';
    
    grid.innerHTML = results.map(art => `
        <article class="archive-card" onclick="window.location.href='uutinen.html?id=${art.id}'">
            <img src="${art.image}" alt="">
            <h3>${art.title}</h3>
        </article>
    `).join('');
}
