import { fetchJSON, renderProjects, fetchGithubData } from "./global.js";

const projects = awat fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');
