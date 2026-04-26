// Lataa navbar ja footer
function loadLayout() {
    fetch('navbar.html').then(r => r.text()).then(html => {
        document.getElementById('navbar-placeholder').innerHTML = html;
        initSearch();
    });
    fetch('footer.html').then(r => r.text()).then(html => {
        document.getElementById('footer-placeholder').innerHTML = html;
    });
}

// Haku-logiikka
function initSearch() {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');

    input.addEventListener('input', async () => {
        const query = input.value.toLowerCase();
        if (query.length < 2) {
            results.style.display = 'none';
            return;
        }

        const res = await fetch('news.json');
        const data = await res.json();
        
        // Haku tärkeysjärjestyksessä: 1. Otsikko, 2. Ingressi, 3. Leipäteksti
        const filtered = data.articles.filter(a => 
            a.title.toLowerCase().includes(query) || 
            a.excerpt.toLowerCase().includes(query) || 
            a.content.toLowerCase().includes(query)
        ).sort((a, b) => {
            if (a.title.toLowerCase().includes(query)) return -1;
            if (b.title.toLowerCase().includes(query)) return 1;
            return 0;
        });

        results.innerHTML = filtered.map(a => `
            <div class="search-item" onclick="window.location.href='uutinen.html?id=${a.id}'">
                <strong>${a.title}</strong>
            </div>
        `).join('');
        results.style.display = 'block';
    });
}

// Etusivun lataus
async function loadFrontPage() {
    const res = await fetch('news.json');
    const data = await res.json();
    const articles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    const grid = document.getElementById('news-grid');
    if (!grid) return;

    const main = articles[0];
    const others = articles.slice(1, 5);

    let html = `
        <div class="main-story card">
            <a href="uutinen.html?id=${main.id}">
                <img src="${main.image}">
                <h2>${main.title}</h2>
                <p style="padding: 0 10px">${main.excerpt}</p>
            </a>
        </div>
        <div class="side-stories">
    `;

    others.forEach(a => {
        html += `
            <div class="card">
                <a href="uutinen.html?id=${a.id}">
                    <img src="${a.image}">
                    <h3>${a.title}</h3>
                </a>
            </div>
        `;
    });

    html += `</div>`;
    grid.innerHTML = html;
}

// Arkiston lataus
async function loadArchive() {
    const res = await fetch('news.json');
    const data = await res.json();
    const articles = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const container = document.getElementById('archive-list');
    container.innerHTML = articles.map(a => `
        <div class="card" style="margin-bottom:20px; display:flex; gap:20px; align-items:center;">
            <img src="${a.image}" style="width:200px">
            <div>
                <h3><a href="uutinen.html?id=${a.id}">${a.title}</a></h3>
                <p>${a.date}</p>
            </div>
        </div>
    `).join('');
}

// Yksittäisen uutisen lataus
async function loadSingleArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const res = await fetch('news.json');
    const data = await res.json();
    const article = data.articles.find(a => a.id == id);

    if (!article) return;

    const content = document.getElementById('article-content');
    content.innerHTML = `
        <img src="${article.image}" style="width:100%; margin-bottom:20px;">
        <h1 style="margin-bottom:10px; line-height:1.2;">${article.title}</h1>
        <p><strong>${article.excerpt}</strong></p>
        <div class="article-body">${article.content}</div>
        
        <div class="share-links">
            <img src="images/facebook.png">
            <img src="images/x.png">
            <img src="images/whatsapp.png">
        </div>
        <div class="divider"></div>
        <div class="article-footer-logo">
            <img src="assets/LOGO3.png">
            <span>Israel-katsaus</span>
        </div>
    `;

    // Uusimmat uutiset sivupalkkiin
    const sidebar = document.getElementById('sidebar-news');
    const latest = data.articles.filter(a => a.id != id).slice(0, 5);
    sidebar.innerHTML = latest.map(a => `
        <div style="margin-bottom:15px">
            <a href="uutinen.html?id=${a.id}" style="text-decoration:none; color:black; font-size:0.9em;">
                <img src="${a.image}" style="width:100%">
                <p>${a.title}</p>
            </a>
        </div>
    `).join('');
}
