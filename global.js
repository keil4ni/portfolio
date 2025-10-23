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
  ? "/"                  // local server
  : "/portfolio/";       // gh pages repo name

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
    let url = p.url;
    if (!url.startsWith('http')) {
        url = BASE_PATH + url;
    }
    // alternative: url = !url.startsWith('http') ? BASE_PATH + url : url;
    
    let title = p.title;

    //before
    // nav.insertAdjacentHTML('beforeend', `<a href = "${url}">${title}</a>`);
    
    //after
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }
    if (a.host !== location.host) {
        a.target = '_blank';
    }
}

// step 4 dark mode
document.body.insertAdjacentHTML(
    'afterbegin',
    `
        <label class = "color-scheme">
            Theme:
            <select>
                <!-- TODO add <option> elements here -->
                <option value = "light dark">Automatic</option>
                <option value = "light">Light</option>
                <option value = "dark">Dark</option>
            </select>
        </label>`,
    );

const select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    select.value = colorScheme;
}

if ('colorScheme' in localStorage) {
    setColorScheme(localStorage.colorScheme);
    select.value = localStorage.colorScheme;
}

select.addEventListener('input', function (event) {
    const scheme = event.target.value;
    setColorScheme(scheme);
    localStorage.colorScheme = scheme;
    console.log('color scheme changed to:', scheme);
});

// lab 5: import project data from proj pg
export async function fetchJSON(url) {
  try {
    // fetch JSON file from given URL
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    // console.log(response);

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
    // code goes here
    containerElement.innerHTML = '';

    const article = document.createElement('article');

    article.innerHTML = `
        <h3>${project.title}</h3>
        <img src = "${project.image}" alt = "${project.title}">
        <p>${project.description}</p>
    `;

    containerElement.appendChild(article);
}

// step 3.1
export async function fetchGithubData(username) {
    // return statement here
    return fetchJSON(`https://api.github.com/users/${username}`);
}

// step 3
const githubData = await fetchGithubData('keil4ni');

// step 4
const profileStats = document.querySelector('#profile-stats');

if (profileStats) {
    profileStats.innerHTML = `
        <dl>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
        </dl>
    `;
}