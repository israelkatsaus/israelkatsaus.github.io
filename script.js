document.addEventListener('DOMContentLoaded', () => {
    // Lataa Navbar ja Footer
    loadComponent('navbar-placeholder', 'navbar.html', setupNavbar);
    loadComponent('footer-placeholder', 'footer.html');

    // Lataa uutiset
    fetch('news.json')
        .then(res => res.json())
        .then(data => {
            const articles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            initPage(articles);
        });
});

function loadComponent(id, file, callback) {
    fetch(file).then(res => res.text()).then(html => {
        document.getElementById(id).innerHTML = html;
        if(callback) callback();
    });
}

function setupNavbar() {
    const ham = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-menu');
    const search = document.getElementById('search-input');

    if(ham) ham.onclick = () => menu.classList.toggle('mobile-open');

    if(search) {
        search.onkeypress = (e) => {
            if(e.key === 'Enter') {
                window.location.href = `archive.html?query=${search.value}`;
            }
        };
    }
}

function initPage(articles) {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    if (path.includes('archive.html')) {
        renderArchive(articles, urlParams.get('query'));
    } else if (path.includes('uutinen.html')) {
        renderArticle(articles, urlParams.get('id'));
    } else {
        renderFrontPage(articles);
    }
}

function renderFrontPage(articles) {
    const container = document.getElementById('front-page-content');
    if(!container) return;

    const main = articles[0];
    const smalls = articles.slice(1, 5);

    let html = `
        <div class="main-article">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}" alt="">
                <h2>${main.title}</h2>
                <p>${main.excerpt}</p>
            </a>
        </div>
        <div class="small-news-grid">
    `;

    smalls.forEach(art => {
        html += `
            <div class="small-article">
                <a href="uutinen.html?id=${art.id}">
                    <img src="${art.image}" alt="">
                    <h3>${art.title}</h3>
                </a>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function renderArchive(articles, query) {
    const grid = document.getElementById('archive-grid');
    if(!grid) return;

    let filtered = articles;
    if(query) {
        const q = query.toLowerCase();
        filtered = articles.filter(a => 
            a.title.toLowerCase().includes(q) || 
            a.excerpt.toLowerCase().includes(q) || 
            a.content.toLowerCase().includes(q)
        ).sort((a, b) => {
            // Tärkeysjärjestys: Otsikko (3), Ingressi (2), Leipäteksti (1)
            const getScore = (art) => {
                if(art.title.toLowerCase().includes(q)) return 3;
                if(art.excerpt.toLowerCase().includes(q)) return 2;
                return 1;
            };
            return getScore(b) - getScore(a);
        });
    }

    grid.innerHTML = filtered.map(art => `
        <div class="small-article">
            <a href="uutinen.html?id=${art.id}">
                <img src="${art.image}" alt="">
                <h3>${art.title}</h3>
            </a>
        </div>
    `).join('');
}

function renderArticle(articles, id) {
    const article = articles.find(a => a.id == id) || articles[0];
    const mainView = document.getElementById('article-content');
    const sidebar = document.getElementById('sidebar-latest');

    mainView.innerHTML = `
        <h1>${article.title}</h1>
        <p class="excerpt">${article.excerpt}</p>
        <img src="${article.image}" class="featured-img" alt="">
        <div class="article-body">${article.content}</div>
        
        <div class="social-share">
            <img src="images/facebook.png" alt="FB">
            <img src="images/x.png" alt="X">
            <img src="images/whatsapp.png" alt="WA">
        </div>
        <div class="divider"></div>
        <div class="author-footer">
            <img src="assets/LOGO3.png" alt="Logo">
            <span>Israel-katsaus</span>
        </div>
    `;

    // Sivupalkkiin 5 uusinta uutista (paitsi nykyinen)
    const latest = articles.filter(a => a.id != article.id).slice(0, 5);
    sidebar.innerHTML = latest.map(art => `
        <div class="small-article" style="margin-bottom:20px">
            <a href="uutinen.html?id=${art.id}">
                <img src="${art.image}" alt="">
                <h3 style="font-size:0.9rem">${art.title}</h3>
            </a>
        </div>
    `).join('');
}
