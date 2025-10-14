//step 1
console.log('hai...');

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

//step 2
// navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname,
// );
// currentLink?.classList.add('current'); // prevents errors w optional chaining operator

//step 3
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/website/";         // GitHub Pages repo name

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'https://github.com/keil4ni', title: 'GitHub'},
    { url: 'resume/', title: 'Resume' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    // let url = p.url;
    if (!url.startsWith('http')) {
        url = BASE_PATH + url;
    }
    // alternative: url = !url.startsWith('http') ? BASE_PATH + url : url;
    
    // let title = p.title;

    // nav.insertAdjacentHTML('beforeend', `<a href = "${url}">${title}</a>`);
    

}



