import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadProj() {
  const projects = await fetchJSON('../lib/projects.json');
  const title = document.querySelector('.projects-title');
if (title) {
    title.textContent = `Projects (${projects.length})`;
  }

  const projectsContainer = document.querySelector('.projects');
  // add search bar
  const searchInput = document.querySelector('.searchBar');
  
  // load proj
  renderProjects(projects, projectsContainer, 'h2');

  function renderPieChart(projectsGiven) {
    let newSVG = d3.select('svg');
    newSVG.selectAll('path').remove();

    let newLegend = d3.select('.legend');
    newLegend.selectAll('*').remove();

    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year
    );

    let newData = newRolledData.map(([year, count]) => {
      return { label: year, value: count };
    });

    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArc = d3.arc().innerRadius(0).outerRadius(50);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    newSVG
      .selectAll('path')
      .data(newArcData)
      .join('path')
      .attr('d', newArc)
      .attr('fill', (_, idx) => colors(idx))
      .on('click', (_, idx) => {
        selectedIndex = selectedIndex === idx ? -1 : idx;

        newSVG
          .selectAll('path')
          .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

        newLegend
          .selectAll('li')
          .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

        console.log('Selected wedge index:', selectedIndex);
      });

    newLegend
      .selectAll('li')
      .data(newData)
      .join('li')
      .attr('style', (_, idx) => `--color:${colors(idx)}`)
      .html(
        (d) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`
      )
      .style('cursor', 'pointer')
      .on('click', (_, idx) => {
        selectedIndex = selectedIndex === idx ? -1 : idx;

        newSVG
          .selectAll('path')
          .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

        newLegend
          .selectAll('li')
          .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
      });
  }

  renderPieChart(projects);

  searchInput.addEventListener('input', (event) => {
    let query = event.target.value.trim().toLowerCase();

    let filteredProjects = projects.filter((project) => {
      let values = Object.values(project).join(' ').toLowerCase();
      return values.includes(query);
    });

    // re-render filtered projects + pie chart
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
  });
}

loadProj();
