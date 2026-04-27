document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar-placeholder', 'navbar.html', initSearch);
    loadComponent('footer-placeholder', 'footer.html');
    
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/') {
        renderFrontPage();
    } else if (path.includes('archive.html')) {
        renderArchive();
    } else if (path.includes('uutinen.html')) {
        renderArticle();
    }
});

async function loadComponent(id, file, callback) {
    const res = await fetch(file);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
    if (callback) callback();
}

async function fetchNews() {
    const res = await fetch('news.json');
    const data = await res.json();
    return data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function renderFrontPage() {
    const articles = await fetchNews();
    const main = articles[0];
    const sides = articles.slice(1, 7);

    document.getElementById('main-article').innerHTML = `
        <a href="uutinen.html?id=${main.id}" class="article-card">
            <img src="${main.image}" alt="">
            <h2>${main.title}</h2>
            <p>${main.excerpt}</p>
        </a>`;

    document.getElementById('side-articles').innerHTML = sides.map(a => `
        <a href="uutinen.html?id=${a.id}" class="side-article">
            <img src="${a.image}" alt="">
            <h3>${a.title}</h3>
        </a>`).join('');
}

async function renderArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const articles = await fetchNews();
    const article = articles.find(a => a.id === id);

    if (article) {
        document.title = `${article.title} | Israel-katsaus`;
        const shareUrl = encodeURIComponent(window.location.href);
        const shareText = encodeURIComponent(article.title);

        document.getElementById('article-content').innerHTML = `
            <img src="${article.image}" alt="">
            <h1>${article.title}</h1>
            <div class="excerpt">${article.excerpt}</div>
            <div class="body-text">${article.content}</div>
            <div class="signature">Israel-katsaus/toimitus</div>
            <div class="share-links">
                <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank"><img src="images/facebook.png"></a>
                <a href="https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}" target="_blank"><img src="images/x.png"></a>
                <a href="https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}" target="_blank"><img src="images/whatsapp.png"></a>
            </div>
            <hr class="divider">
        `;
        
        // Sivupalkki (uusimmat, pois lukien nykyinen)
        const latest = articles.filter(a => a.id !== id).slice(0, 5);
        document.getElementById('latest-news-sidebar').innerHTML = latest.map(a => `
            <a href="uutinen.html?id=${a.id}" class="side-article">
                <img src="${a.image}">
                <h3>${a.title}</h3>
            </a><br>`).join('');
    }
}

function initSearch() {
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            const term = e.target.value.toLowerCase();
            window.location.href = `archive.html?search=${term}`;
        }
    };
    document.getElementById('search-input')?.addEventListener('keypress', handleSearch);
    document.getElementById('search-input-mobile')?.addEventListener('keypress', handleSearch);
}

async function renderArchive() {
    const articles = await fetchNews();
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get('search');
    
    let filtered = articles;
    if (searchTerm) {
        filtered = articles.filter(a => 
            a.title.toLowerCase().includes(searchTerm) || 
            a.excerpt.toLowerCase().includes(searchTerm) || 
            a.content.toLowerCase().includes(searchTerm)
        );
    }

    document.getElementById('archive-list').innerHTML = filtered.map(a => `
        <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <a href="uutinen.html?id=${a.id}">
                <h3>${a.title}</h3>
                <small>${a.date}</small>
            </a>
        </div>`).join('');
}

function toggleMobileMenu() {
    document.getElementById('mobile-dropdown').classList.toggle('active');
}
