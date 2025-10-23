import { fetchJSON, renderProjects } from '../global.js';

async function loadProj() {
    const projects = await fetchJSON('../lib/projects.json');
    const title = document.querySelector('.projects-title');
    if (title) {
        title.textContent = `Projects (${projects.length})`;
    }
    const projectsContainer = document.querySelector('.projects');
    renderProjects(projects, projectsContainer, 'h2');
}

loadProj();