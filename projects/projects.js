import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadProj() {
    const projects = await fetchJSON('../lib/projects.json');
    const title = document.querySelector('.projects-title');
    if (title) {
        title.textContent = `Projects (${projects.length})`;
    }
    const projectsContainer = document.querySelector('.projects');
    renderProjects(projects, projectsContainer, 'h2');
}

// lab 5
let arcGen = d3.arc().innerRadius(0).outerRadius(50);

let data = [
    { value: 1, label: 'apples'},
    { value: 2, label: 'oranges'},
    { value: 3, label: 'mangos'},
    { value: 4, label: 'pears'},
    { value: 5, label: 'limes'},
    { value: 5, label: 'cherries'},
];

// let data = [1, 2, 3, 4, 5, 5];

// let sliceGenerator = d3.pie();
let sliceGenerator = d3.pie().value((d) => d.value);

let arcData = sliceGenerator(data);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

arcData.forEach((d, idx) => {
  d3.select('svg')
    .append('path')
    .attr('d', arcGen(d))
    .attr('fill', colors(idx));
});

// step 2: adding legend
let legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
});

// let projects = await fetch('../lib/projects.json');
// let rolledData = d3.rollups(
//     projects,
//     (v) => v.length,
//     (d) => d.year,
// );

// let data = rolledData.map(([year, count]) => {
//     return { value: count, label: year};
// });

loadProj();