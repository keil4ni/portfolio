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

let arcGen = d3.arc().innerRadius(0).outerRadius(50);
let arc = arcGen({
    startAngle: 0,
    endAngle: 2 * Math.PI,
});

d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

// this is also valid:
// let arc = d3.arc().innerRadius(0).outerRadius(50)({
//   startAngle: 0,
//   endAngle: 2 * Math.PI,
// });

loadProj();