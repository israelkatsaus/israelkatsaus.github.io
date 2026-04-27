async function loadComponent(id,file){
  const res = await fetch(file);
  document.getElementById(id).innerHTML = await res.text();
}

loadComponent('navbar','navbar.html');
loadComponent('footer','footer.html');

function toggleMenu(){
  const m = document.getElementById('mobile-menu');
  m.style.display = m.style.display==='flex'?'none':'flex';
}

async function getNews(){
  const res = await fetch('news.json');
  const data = await res.json();
  return data.articles.sort((a,b)=> new Date(b.date)-new Date(a.date));
}

/* HAKU */
function searchArticles(articles,term){
  term = term.toLowerCase();

  return articles.map(a=>({
    ...a,
    score:
      (a.title.toLowerCase().includes(term)?3:0)+
      (a.excerpt.toLowerCase().includes(term)?2:0)+
      (a.content.toLowerCase().includes(term)?1:0)
  }))
  .filter(a=>a.score>0)
  .sort((a,b)=>b.score-a.score);
}

getNews().then(articles=>{

  /* ETUSIVU */
  const main = document.getElementById('main-news');
  if(main){
    const [first,...rest] = articles;

    main.innerHTML = `
      <div class="main-layout">
        <div>
          <img src="${first.image}" class="main-img">
          <h2>${first.title}</h2>
        </div>

        <div class="grid">
          ${rest.slice(0,6).map(a=>`
            <a href="uutinen.html?id=${a.id}">
              <img src="${a.image}">
              <h4>${a.title}</h4>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* ARKISTO */
  const archive = document.getElementById('archive');
  if(archive){
    archive.innerHTML = articles.map(a=>`
      <div>
        <a href="uutinen.html?id=${a.id}">${a.title}</a>
      </div>
    `).join('');
  }

  /* UUTINEN */
  const articlePage = document.getElementById('article');
  if(articlePage){
    const id = new URLSearchParams(location.search).get('id');
    const art = articles.find(a=>a.id==id);

    articlePage.innerHTML = `
      <img src="${art.image}" class="article-img">
      <h1>${art.title}</h1>
      <p>${art.excerpt}</p>

      <div style="height:10px;"></div>

      ${art.content}

      <div class="meta">
        <b>Israel-katsaus/toimitus</b>

        <div class="share">
          <a href="https://www.facebook.com/sharer/sharer.php?u=${location.href}" target="_blank">
            <img src="images/facebook.png">
          </a>
          <a href="https://twitter.com/intent/tweet?url=${location.href}" target="_blank">
            <img src="images/x.png">
          </a>
          <a href="https://api.whatsapp.com/send?text=${location.href}" target="_blank">
            <img src="images/whatsapp.png">
          </a>
        </div>
      </div>

      <hr>
    `;

    /* UUSIMMAT */
    document.getElementById('latest').innerHTML =
      articles.slice(0,5).map(a=>`
        <div>
          <a href="uutinen.html?id=${a.id}">${a.title}</a>
        </div>
      `).join('');
  }

  /* HAKU */
  document.addEventListener('submit', e=>{
    if(e.target.id==='searchForm'){
      e.preventDefault();
      const term = document.getElementById('search').value;
      const results = searchArticles(articles,term);

      document.querySelector('.container').innerHTML =
        results.map(a=>`
          <div>
            <a href="uutinen.html?id=${a.id}">${a.title}</a>
          </div>
        `).join('');
    }
  });

});
