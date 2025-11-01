// import { fetchJSON, renderProjects } from '../global.js';
// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// async function loadProj() {
//   const projects = await fetchJSON('../lib/projects.json');
//   const title = document.querySelector('.projects-title');
// if (title) {
//     title.textContent = `Projects (${projects.length})`;
//   }

//   const projectsContainer = document.querySelector('.projects');
//   // add search bar
//   const searchInput = document.querySelector('.searchBar');
  
//   // load proj
//   renderProjects(projects, projectsContainer, 'h2');

//   function renderPieChart(projectsGiven) {
//     let newSVG = d3.select('svg');
//     newSVG.selectAll('path').remove();

//     let newLegend = d3.select('.legend');
//     newLegend.selectAll('*').remove();

//     let newRolledData = d3.rollups(
//       projectsGiven,
//       (v) => v.length,
//       (d) => d.year
//     );

//     let newData = newRolledData.map(([year, count]) => {
//       return { label: year, value: count };
//     });

//     let newSliceGenerator = d3.pie().value((d) => d.value);
//     let newArcData = newSliceGenerator(newData);
//     let newArc = d3.arc().innerRadius(0).outerRadius(50);
//     let colors = d3.scaleOrdinal(d3.schemeTableau10);

//     newSVG
//       .selectAll('path')
//       .data(newArcData)
//       .join('path')
//       .attr('d', newArc)
//       .attr('fill', (_, idx) => colors(idx))
//       .on('click', (_, idx) => {
//         selectedIndex = selectedIndex === idx ? -1 : idx;

//         newSVG
//           .selectAll('path')
//           .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

//         newLegend
//           .selectAll('li')
//           .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

//         console.log('Selected wedge index:', selectedIndex);
//       });

//     newLegend
//       .selectAll('li')
//       .data(newData)
//       .join('li')
//       .attr('style', (_, idx) => `--color:${colors(idx)}`)
//       .html(
//         (d) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`
//       )
//       .style('cursor', 'pointer')
//       .on('click', (_, idx) => {
//         selectedIndex = selectedIndex === idx ? -1 : idx;

//         newSVG
//           .selectAll('path')
//           .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

//         newLegend
//           .selectAll('li')
//           .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
//       });
//   }

//   renderPieChart(projects);

//   searchInput.addEventListener('input', (event) => {
//     let query = event.target.value.trim().toLowerCase();

//     let filteredProjects = projects.filter((project) => {
//       let values = Object.values(project).join(' ').toLowerCase();
//       return values.includes(query);
//     });

//     // re-render filtered projects + pie chart
//     renderProjects(filteredProjects, projectsContainer, 'h2');
//     renderPieChart(filteredProjects);
//   });
// }

// loadProj();


import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

let selectedIndex = -1;

let query = '';
const searchInput = document.querySelector('.searchBar');

function renderPieChart(projectsGiven) {
  d3.select('#projects-plot').selectAll('*').remove();
  d3.select('.legend').selectAll('*').remove();

  const rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  const data = rolledData.map(([year, count]) => ({ value: count, label: year }));

  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const arcs = arcData.map((d) => arcGenerator(d));

  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  arcs.forEach((arc, idx) => {
    d3.select('#projects-plot')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
  });

  const legend = d3.select('.legend');
  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });

  function reRenderForSelection(selectedLabelOrNull) {
    const q = (searchInput?.value || '').toLowerCase();
    const visible = projects.filter((project) => {
      const values = Object.values(project).join('\n').toLowerCase();
      return values.includes(q);
    });

    const listData =
      selectedLabelOrNull == null
        ? visible
        : visible.filter((p) => String(p.year) === String(selectedLabelOrNull));

    renderProjects(listData, projectsContainer, 'h2');
    renderPieChart(visible);
  }

  const sliceSel = d3.select('#projects-plot').selectAll('path');
  const legendSel = d3.select('.legend').selectAll('li');

  sliceSel.attr('class', (_, i) => (selectedIndex === -1 ? '' : i === selectedIndex ? 'selected' : ''));
  legendSel.attr('class', (_, i) => (selectedIndex === -1 ? '' : i === selectedIndex ? 'selected' : ''));

  sliceSel.each(function (_, i) {
    d3.select(this).on('click', () => {
      selectedIndex = selectedIndex === i ? -1 : i;
      const sliceLabel = selectedIndex === -1 ? null : data[i].label;
      reRenderForSelection(sliceLabel);
    });
  });

  legendSel.each(function (_, i) {
    d3.select(this).on('click', () => {
      selectedIndex = selectedIndex === i ? -1 : i;
      const sliceLabel = selectedIndex === -1 ? null : data[i].label;
      reRenderForSelection(sliceLabel);
    });
  });
}

if (projects) {
  const titleElement = document.querySelector('.projects-title');
  const projectCount = projects.length;
  if (titleElement) {
    titleElement.textContent = `Projects (${projectCount})`;
  }
  renderProjects(projects, projectsContainer, 'h2');
  renderPieChart(projects); 
} else {
  console.error("Projects data could not be loaded.");
}

searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  const filteredProjects = projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});

