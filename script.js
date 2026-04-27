let allArticles = [];

async function loadArticles() {
    try {
        const res = await fetch('news.json');
        const data = await res.json();
        allArticles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        return allArticles;
    } catch (e) {
        console.error("Virhe ladattaessa uutisia:", e);
        return [];
    }
}

// Yhteinen navbar ja footer
async function initCommon() {
    // Navbar
    const navbarHTML = await fetch('navbar.html').then(r => r.text());
    document.getElementById('navbar').innerHTML = navbarHTML;
    
    // Footer
    const footerHTML = await fetch('footer.html').then(r => r.text());
    document.getElementById('footer').innerHTML = footerHTML;
}

// Haku (otsikko > ingressi > sisältö)
function searchArticles(query = null) {
    const input = document.getElementById('searchInput');
    const term = (query || input.value || '').toLowerCase().trim();
    if (!term) return;
    
    const filtered = allArticles.filter(article => {
        return article.title.toLowerCase().includes(term) ||
               (article.excerpt && article.excerpt.toLowerCase().includes(term)) ||
               (article.content && article.content.toLowerCase().includes(term));
    });
    
    if (window.location.pathname.includes('archive.html')) {
        renderArchive(filtered);
    } else {
        // Ohjaa etusivulle tai näytä tulokset
        window.location.href = `index.html?search=${encodeURIComponent(term)}`;
    }
}

function searchFromMobile() {
    const term = prompt("Hae uutisia:");
    if (term) searchArticles(term);
}

// Renderöi etusivu
async function renderHome() {
    const articles = await loadArticles();
    const container = document.getElementById('mainContent');
    
    if (!articles.length) {
        container.innerHTML = "<p>Ei uutisia saatavilla.</p>";
        return;
    }
    
    const featured = articles[0];
    let html = `
        <div class="featured">
            <a href="uutinen.html?id=${featured.id}">
                <img src="${featured.image}" alt="${featured.title}">
            </a>
            <a href="uutinen.html?id=${featured.id}" style="text-decoration:none;color:inherit;">
                <h1>${featured.title}</h1>
            </a>
            <p class="date">${featured.date}</p>
        </div>
        
        <div class="small-news">
    `;
    for (let i = 1; i < Math.min(7, articles.length); i++) {
        const art = articles[i];
        html += `
            <article>
                <a href="uutinen.html?id=${art.id}">
                    <img src="${art.image}" alt="${art.title}">
                </a>
                <a href="uutinen.html?id=${art.id}" style="text-decoration:none;color:inherit;">
                    <h3>${art.title}</h3>
                </a>
                <p class="date">${art.date}</p>
            </article>
        `;
    }
    html += `</div>`;
    
    container.innerHTML = html;
}

// Renderöi arkisto
async function renderArchive(filtered = null) {
    const articles = filtered || await loadArticles();
    const grid = document.getElementById('archiveGrid');
    
    let html = '';
    articles.forEach(article => {
        html += `
            <article>
                <a href="uutinen.html?id=${article.id}">
                    <img src="${article.image}" alt="${article.title}">
                </a>
                <a href="uutinen.html?id=${article.id}" style="text-decoration:none;color:inherit;">
                    <h3>${article.title}</h3>
                </a>
                <p class="date">${article.date}</p>
            </article>
        `;
    });
    
    grid.innerHTML = html;
}

// Yksittäinen uutinen
async function renderArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    
    if (!id) return;
    
    const articles = await loadArticles();
    const article = articles.find(a => a.id === id);
    
    if (!article) {
        document.getElementById('articleContent').innerHTML = "<p>Uutista ei löytynyt.</p>";
        return;
    }
    
    document.getElementById('pageTitle').textContent = article.title + " - Israel-katsaus";
    
    const contentDiv = document.getElementById('articleContent');
    
    let html = `
        <img src="${article.image}" alt="${article.title}">
        <h1>${article.title}</h1>
        <p class="date">${article.date}</p>
        
        ${article.excerpt ? `<p class="excerpt">${article.excerpt}</p>` : ''}
        
        <div class="content">
            ${article.content}
        </div>
        
        <div class="meta">
            Israel-katsaus/toimitus
            <div class="share-icons">
                <a href="#" onclick="shareTo('facebook'); return false;"><img src="images/facebook.png" alt="Facebook"></a>
                <a href="#" onclick="shareTo('x'); return false;"><img src="images/x.png" alt="X"></a>
                <a href="#" onclick="shareTo('whatsapp'); return false;"><img src="images/whatsapp.png" alt="WhatsApp"></a>
            </div>
        </div>
        <div class="divider"></div>
    `;
    
    contentDiv.innerHTML = html;
    
    // Renderöi sidebar uusimmat (ilman nykyistä)
    renderSidebar(articles.filter(a => a.id !== id).slice(0, 6));
}

// Sidebar uusimmille
function renderSidebar(articles) {
    const container = document.getElementById('sidebarArticles');
    let html = '';
    
    articles.forEach(article => {
        html += `
            <article>
                <a href="uutinen.html?id=${article.id}">
                    <img src="${article.image}" alt="${article.title}">
                </a>
                <a href="uutinen.html?id=${article.id}" style="text-decoration:none;color:inherit;">
                    <h4>${article.title}</h4>
                </a>
            </article>
        `;
    });
    
    container.innerHTML = html;
}

// Some-jakaminen
function shareTo(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    let shareUrl = '';
    
    if (platform === 'facebook') {
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'x') {
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
    } else if (platform === 'whatsapp') {
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
    }
    
    if (shareUrl) window.open(shareUrl, '_blank');
}

// Mobiilivalikko
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('show');
}

// Pääohjaus
async function init() {
    await initCommon();
    
    const path = window.location.pathname;
    
    if (path.includes('archive.html')) {
        await renderArchive();
    } else if (path.includes('uutinen.html')) {
        await renderArticle();
        document.getElementById('sidebar').style.display = 'block';
    } else {
        // Etusivu (index.html)
        await renderHome();
        
        // Tarkista mahdollinen hakuparametri
        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('search');
        if (searchTerm) {
            // Tässä voisi näyttää hakutulokset erikseen, mutta yksinkertaisuuden vuoksi ohjataan hakuun
            console.log("Hakutermi:", searchTerm);
        }
    }
    
    // Hakukenttä toimii kaikilla sivuilla
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchArticles();
        });
    }
}

window.onload = init;
