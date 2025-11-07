import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      return {
        id: commit,
        url: 'https://github.com/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        // calc hour as a decimal for time analysis
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        // how many lines were modified
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,
        writable: true,
        configurable: true
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add most active time of day
  const timeOfDayCt = d3.rollup(
    commits,
    v => v.length,
    d => getTimeOfDay(d.hourFrac)
  );

  const mostActiveTime = Array.from(timeOfDayCt.entries())
    .sort((a, b) => b[1] - a[1])[0][0];

  const dayCt = d3.rollup(
    commits,
    v => v.length,
    d => d.datetime.getDay()
  );

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const mostActiveDay = days[
    Array.from(dayCt.entries()).sort((a, b) => b[1] - a[1])[0][0]
  ];

  dl.append('dt').text('Most active time');
  dl.append('dd').text(mostActiveTime);

  dl.append('dt').text('Most active day');
  dl.append('dd').text(mostActiveDay);

  // Helper function
 function getTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
 }

  // Add total number of files in codebase
   const uniqueFiles = new Set(data.map(d => d.file));
   const numFiles = uniqueFiles.size;
   dl.append('dt').text('Total files');
   dl.append('dd').text(numFiles);

}

function renderScatterPlot(data, commits) {
    const width = 1000;
    const height = 600;

    const svg = d3
      .select('#chart')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');

    const xScale = d3
      .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();
    
    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
    
    const dots = svg.append('g').attr('class', 'dots');
    
    dots
      .selectAll('circle')
      .data(commits)
      .join('circle')
      .attr('cx', (d) => xScale(d.datetime))
      .attr('cy', (d) => yScale(d.hourFrac))
      .attr('r', 5)
      .attr('fill', 'steelblue');

    // step 2.2
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    // update scale w new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    // Add gridlines BEFORE the axes
    const gridlines = svg
      .append('g')
      .attr('class', 'gridlines')
      .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
    // d % 24 gets 0 instead of 24 for midnight
    // String(d % 24) converts num to str
    // string.padStart() formats as 2 digit num
    // append ":00" to appear as timestamp

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${usableArea.bottom})`)
      .call(xAxis);

    // Add Y axis
    svg
      .append('g')
      .attr('transform', `translate(${usableArea.left}, 0)`)
      .call(yAxis);

}

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);

// console.log(commits);