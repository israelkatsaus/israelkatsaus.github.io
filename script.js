document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar-placeholder', 'navbar.html');
    loadComponent('footer-placeholder', 'footer.html');
    
    const page = window.location.pathname;
    if (page.includes('archive.html')) {
        renderArchive();
    } else if (page.includes('uutinen.html')) {
        renderArticle();
    } else {
        renderFrontPage();
    }
});

async function loadComponent(id, file) {
    const res = await fetch(file);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
}

async function getNews() {
    const res = await fetch('news.json');
    const data = await res.json();
    // Järjestetään uusimmasta vanhimpaan
    return data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function renderFrontPage() {
    const articles = await getNews();
    const mainContainer = document.getElementById('news-content');
    
    const main = articles[0];
    const side = articles.slice(1, 7);

    let sideHtml = side.map(art => `
        <div class="news-item">
            <a href="uutinen.html?id=${art.id}">
                <img src="${art.image}">
                <h3>${art.title}</h3>
            </a>
        </div>
    `).join('');

    mainContainer.innerHTML = `
        <div class="home-grid">
            <div class="news-item main-feature">
                <a href="uutinen.html?id=${art.id}">
                    <img src="${main.image}">
                    <h2>${main.title}</h2>
                    <p>${main.excerpt}</p>
                </a>
            </div>
            <div class="secondary-grid">${sideHtml}</div>
        </div>
    `;
}

async function renderArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const articles = await getNews();
    const article = articles.find(a => a.id == id);
    const latest = articles.slice(0, 5);

    if (article) {
        document.title = article.title;
        document.getElementById('article-area').innerHTML = `
            <div class="article-content">
                <h1>${article.title}</h1>
                <img src="${article.image}">
                <div class="excerpt">${article.excerpt}</div>
                <div class="body-text">${article.content}</div>
                <div class="share-area">
                    <div class="share-links">
                        <img src="images/facebook.png">
                        <img src="images/x.png">
                        <img src="images/whatsapp.png">
                    </div>
                    <hr class="small-divider">
                    <div class="brand-footer-small">
                        <img src="assets/LOGO3.png"> Israel-katsaus
                    </div>
                </div>
            </div>
            <aside class="sidebar">
                <h4>Uusimmat uutiset</h4>
                ${latest.map(l => `<p><a href="uutinen.html?id=${l.id}" style="color:#333; font-size:0.9rem;">${l.title}</a></p><hr>`).join('')}
            </aside>
        `;
    }
}

async function renderArchive() {
    const articles = await getNews();
    const container = document.getElementById('archive-content');
    container.innerHTML = articles.map(art => `
        <div class="news-item">
            <a href="uutinen.html?id=${art.id}">
                <img src="${art.image}">
                <h3>${art.title}</h3>
            </a>
        </div>
    `).join('');
}

// Hakutoiminto tärkeysjärjestyksellä
async function checkSearch(e) {
    if (e.key === 'Enter') {
        const query = e.target.value.toLowerCase();
        const articles = await getNews();
        
        const results = articles.map(art => {
            let priority = 0;
            if (art.title.toLowerCase().includes(query)) priority = 3;
            else if (art.excerpt.toLowerCase().includes(query)) priority = 2;
            else if (art.content.toLowerCase().includes(query)) priority = 1;
            return { ...art, priority };
        })
        .filter(a => a.priority > 0)
        .sort((a, b) => b.priority - a.priority);

        displaySearchResults(results, query);
    }
}

function displaySearchResults(results, query) {
    const container = document.querySelector('.main-container');
    container.innerHTML = `<h1>Hakutulokset: ${query}</h1><div class="archive-grid">` + 
        results.map(art => `
            <div class="news-item">
                <a href="uutinen.html?id=${art.id}">
                    <img src="${art.image}">
                    <h3>${art.title}</h3>
                </a>
            </div>
        `).join('') + `</div>`;
}

function toggleMobileMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}
