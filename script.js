document.addEventListener('DOMContentLoaded', () => {
    // Ladataan Navbar ja Footer
    Promise.all([
        fetch('navbar.html').then(r => r.text()),
        fetch('footer.html').then(r => r.text())
    ]).then(([nav, foot]) => {
        document.getElementById('navbar-placeholder').innerHTML = nav;
        document.getElementById('footer-placeholder').innerHTML = foot;
        setupNavLogic();
    });

    // Haetaan uutiset
    fetch('news.json').then(r => r.json()).then(data => {
        const articles = data.articles.sort((a,b) => new Date(b.date) - new Date(a.date));
        route(articles);
    });
});

function setupNavLogic() {
    const toggle = document.getElementById('hamburger-toggle');
    const overlay = document.getElementById('mobile-overlay');
    if(toggle) toggle.onclick = () => overlay.classList.toggle('open');

    const searchAction = (e) => {
        if(e.key === 'Enter') window.location.href = `archive.html?search=${e.target.value}`;
    };
    document.getElementById('desktop-search')?.addEventListener('keypress', searchAction);
    document.getElementById('mobile-search')?.addEventListener('keypress', searchAction);
}

function route(articles) {
    const params = new URLSearchParams(window.location.search);
    const page = window.location.pathname.split("/").pop();

    if(page === 'archive.html') renderArchive(articles, params.get('search'));
    else if(page === 'uutinen.html') renderArticle(articles, params.get('id'));
    else renderFrontPage(articles);
}

function renderFrontPage(articles) {
    const container = document.getElementById('front-page-content');
    if(!container) return;
    const main = articles[0];
    const side = articles.slice(1, 7);

    container.innerHTML = `
        <div class="main-news-item">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}" alt="">
                <h2>${main.title}</h2>
                <p style="margin-top:10px">${main.excerpt}</p>
            </a>
        </div>
        <div class="side-news-grid">
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
    const container = document.getElementById('archive-grid') || document.getElementById('front-page-content');
    let results = articles;

    if(query) {
        const q = query.toLowerCase();
        results = articles.map(a => {
            let score = 0;
            if(a.title.toLowerCase().includes(q)) score = 3;
            else if(a.excerpt.toLowerCase().includes(q)) score = 2;
            else if(a.content.toLowerCase().includes(q)) score = 1;
            return {...a, score};
        }).filter(a => a.score > 0).sort((a,b) => b.score - a.score);
    }

    container.className = "archive-grid-custom";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
    container.style.gap = "20px";
    
    container.innerHTML = results.map(a => `
        <div class="small-item">
            <a href="uutinen.html?id=${a.id}">
                <img src="${a.image}" alt="">
                <h3>${a.title}</h3>
            </a>
        </div>
    `).join('');
}

function renderArticle(articles, id) {
    const container = document.getElementById('front-page-content');
    const art = articles.find(a => a.id == id) || articles[0];
    const latest = articles.filter(a => a.id != art.id).slice(0, 6);
    
    const url = encodeURIComponent(window.location.href);
    container.className = "article-layout";
    container.innerHTML = `
        <div class="article-main">
            <img src="${art.image}" alt="">
            <h1>${art.title}</h1>
            <div class="ingress">${art.excerpt}</div>
            <div class="content-body">${art.content}</div>
            <div class="article-footer">
                <span class="author">Israel-katsaus/toimitus</span>
                <div class="share-btns">
                    <img src="images/facebook.png" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${url}')">
                    <img src="images/x.png" onclick="window.open('https://twitter.com/intent/tweet?url=${url}')">
                    <img src="images/whatsapp.png" onclick="window.open('https://api.whatsapp.com/send?text=${url}')">
                </div>
            </div>
            <div class="bottom-line"></div>
        </div>
        <aside class="side-news-grid" style="grid-template-columns: 1fr;">
            ${latest.map(a => `
                <div class="small-item">
                    <a href="uutinen.html?id=${a.id}">
                        <img src="${a.image}" alt="">
                        <h3>${a.title}</h3>
                    </a>
                </div>
            `).join('')}
        </aside>
    `;
}
