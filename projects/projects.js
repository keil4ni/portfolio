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

  // lab 5
  const rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year
  );

  // convert format
  let data = rolledData.map(([year, count]) => {
    return {value: count, label: year};
  });

  // add pie chart
  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  arcData.forEach((d, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arcGen(d))
      .attr('fill', colors(idx));
  });

  // add legend
  let legend = d3.select('.legend');
  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });

}

loadProj();
