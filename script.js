document.addEventListener('DOMContentLoaded', () => {
    loadTemplate('navbar-placeholder', 'navbar.html', setupNavbar);
    loadTemplate('footer-placeholder', 'footer.html');
    fetchNews();
});

function loadTemplate(id, file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback();
        });
}

function setupNavbar() {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('nav-menu');
    const searchInput = document.getElementById('search-input');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            menu.classList.toggle('active');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.location.href = `archive.html?search=${searchInput.value}`;
            }
        });
    }
}

async function fetchNews() {
    try {
        const response = await fetch('news.json');
        const data = await response.json();
        const articles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));

        const urlParams = new URLSearchParams(window.location.search);
        const searchId = urlParams.get('id');
        const searchQuery = urlParams.get('search');

        if (document.getElementById('news-grid')) {
            renderFrontPage(articles);
        } else if (document.getElementById('archive-grid')) {
            renderArchive(articles, searchQuery);
        } else if (document.getElementById('article-content')) {
            renderArticle(articles, searchId);
        }
    } catch (error) {
        console.error("Virhe ladattaessa uutisia:", error);
    }
}

function renderFrontPage(articles) {
    const grid = document.getElementById('news-grid');
    const main = articles[0];
    const smallOnes = articles.slice(1, 7);

    let html = `
        <div class="main-news">
            <a href="uutinen.html?id=${main.id}">
                <div class="news-card">
                    <img src="${main.image}" alt="">
                    <h2>${main.title}</h2>
                    <p>${main.excerpt}</p>
                </div>
            </a>
        </div>
        <div class="small-news-container">
    `;

    smallOnes.forEach(art => {
        html += `
            <div class="small-news">
                <a href="uutinen.html?id=${art.id}">
                    <div class="news-card">
                        <img src="${art.image}" alt="">
                        <h3>${art.title}</h3>
                    </div>
                </a>
            </div>
        `;
    });

    html += `</div>`;
    grid.innerHTML = html;
}

function renderArchive(articles, query) {
    const grid = document.getElementById('archive-grid');
    let filtered = articles;

    if (query) {
        const q = query.toLowerCase();
        filtered = articles.sort((a, b) => {
            // Tärkeysjärjestys hakuun
            const score = (art) => {
                if (art.title.toLowerCase().includes(q)) return 3;
                if (art.excerpt.toLowerCase().includes(q)) return 2;
                if (art.content.toLowerCase().includes(q)) return 1;
                return 0;
            };
            return score(b) - score(a);
        }).filter(art => art.title.toLowerCase().includes(q) || art.excerpt.toLowerCase().includes(q) || art.content.toLowerCase().includes(q));
        
        document.querySelector('h1').innerText = `Haun tulokset: "${query}"`;
    }

    grid.innerHTML = filtered.map(art => `
        <div class="news-card">
            <a href="uutinen.html?id=${art.id}">
                <img src="${art.image}" alt="">
                <h3>${art.title}</h3>
                <p style="font-size: 0.8em">${art.date}</p>
            </a>
        </div>
    `).join('');
}

function renderArticle(articles, id) {
    const article = articles.find(a => a.id == id) || articles[0];
    const contentDiv = document.getElementById('article-content');
    const sidebarDiv = document.getElementById('latest-news-sidebar');

    contentDiv.innerHTML = `
        <div class="article-header">
            <h1>${article.title}</h1>
            <p class="excerpt">${article.excerpt}</p>
        </div>
        <img src="${article.image}" class="featured-image" alt="">
        <div class="content">
            ${article.content}
        </div>
        <div class="social-share">
            <a href="#"><img src="images/facebook.png" alt="FB"></a>
            <a href="#"><img src="images/x.png" alt="X"></a>
            <a href="#"><img src="images/whatsapp.png" alt="WA"></a>
        </div>
        <hr class="separator">
        <div class="author-info">
            <img src="assets/LOGO3.png" alt="">
            <span>Israel-katsaus</span>
        </div>
    `;

    // Sivupalkki (uusimmat, poislukien nykyinen)
    const latest = articles.filter(a => a.id != article.id).slice(0, 5);
    sidebarDiv.innerHTML = latest.map(art => `
        <div class="small-news" style="margin-bottom: 15px;">
            <a href="uutinen.html?id=${art.id}">
                <img src="${art.image}" alt="" style="width:100%">
                <h3 style="font-size: 14px;">${art.title}</h3>
            </a>
        </div>
    `).join('');
}
