/* ==============================
LOAD MODULES
============================== */

async function loadNavbar(){
const res = await fetch("navbar.html");
document.getElementById("navbar").innerHTML = await res.text();
}

async function loadFooter(){
const res = await fetch("footer.html");
document.getElementById("footer").innerHTML = await res.text();
}


/* ==============================
MENU
============================== */

function toggleMenu(){

const nav=document.getElementById("navLinks");
if(nav) nav.classList.toggle("active");

}

function closeMenu(){

const nav=document.getElementById("navLinks");
if(nav) nav.classList.remove("active");

}


/* sulje menu kun klikataan linkkiä */

document.addEventListener("click",(e)=>{

if(e.target.closest(".nav-links a")){
closeMenu();
}

});


/* ==============================
LOAD NEWS
============================== */

async function loadNews(){

try{

const response = await fetch("news.json");

if(!response.ok)
throw new Error("Uutisten lataus epäonnistui");

const data = await response.json();

const articles = (data && Array.isArray(data.articles))
? data.articles
.filter(a => a.date)
.sort((a,b)=> new Date(b.date) - new Date(a.date))
: [];

const container = document.getElementById("newsContainer");

if(!container) return;

if(!articles.length){

container.innerHTML="<p>Ei uutisia saatavilla.</p>";
return;

}

const main = articles[0];

let html = `

<a href="uutinen.html?id=${main.id}" class="main-article">

<img src="${main.image}" alt="${main.title}" loading="lazy">

<div class="main-text">
<h2>${main.title}</h2>
<p>${main.excerpt}</p>
</div>

</a>
`;

html += `
<div class="small-news">

${articles.slice(1,5).map(article => `

<a href="uutinen.html?id=${article.id}" class="news-card">

<img src="${article.image}" alt="${article.title}" loading="lazy">

<h3>${article.title}</h3>

</a>

`).join("")}

</div>
`;

container.innerHTML = html;

}catch(err){

console.error(err);

const container = document.getElementById("newsContainer");

if(container)
container.innerHTML="<p>Virhe uutisten latauksessa.</p>";

}

}


/* ==============================
INIT
============================== */

document.addEventListener("DOMContentLoaded",()=>{

loadNavbar();
loadFooter();
loadNews();

});
