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
        lines: lines
      };
    });
}

function renderCommitInfo(data, commits) {
  // create dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // add most active time of day
  const timeOfDayCt = d3.rollup(
    commits,
    v => v.length,
    d => getTimeOfDay(d.hourFrac)
  );

  const mostActiveTime = Array.from(timeOfDayCt.entries())
    .sort((a, b) => b[1] - a[1])[0][0];

  dl.append('dt').text('Most active time');
  dl.append('dd').text(mostActiveTime);

  // add most active day
  const dayCt = d3.rollup(
    commits,
    v => v.length,
    d => d.datetime.getDay()
  );

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const mostActiveDay = days[
    Array.from(dayCt.entries()).sort((a, b) => b[1] - a[1])[0][0]
  ];

  dl.append('dt').text('Most active day');
  dl.append('dd').text(mostActiveDay);

  // add total num of files
  const uniqueFiles = new Set(data.map(d => d.file));
  const numFiles = uniqueFiles.size;

  dl.append('dt').text('Total files');
  dl.append('dd').text(numFiles);

  // helper func
 function getTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
 }

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
    
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
      .scaleSqrt()
      .domain([minLines, maxLines])
      .range([2, 30]);

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

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

    // draw dots after scaling axes
    dots
      .selectAll('circle')
      .data(sortedCommits)
      .join('circle')
      .attr('cx', (d) => xScale(d.datetime))
      .attr('cy', (d) => yScale(d.hourFrac))
      .attr('r', (d) => rScale(d.totalLines))
      .attr('fill', 'steelblue')
      .style('fill-opacity', 0.7) // transparency for overlapping dots
      .on('mouseenter', (event, commit) => {
        renderTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on('mouseleave', (event) => {
        // hide tooltip
        d3.select(event.currentTarget).style('fill-opacity', 0.7);
        updateTooltipVisibility(false);
      });

    // add gridlines before axes
    const gridlines = svg
      .append('g')
      .attr('class', 'gridlines')
      .attr('transform', `translate(${usableArea.left}, 0)`);

    // create gridlines as axis w no labels and full-width ticks
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

    // add x-axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${usableArea.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '14px')
      .attr('dy', '1.2em')
      .attr('dx', '-0.2em')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-25)');

    // add y-axis
    svg
      .append('g')
      .attr('transform', `translate(${usableArea.left}, 0)`)
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '14px')
      .attr('dx', '-0.5em');

    function isCommitSelected(selection, commit) {
    if (!selection) return false;
    // return true if commit is within brushSelection & false if not
    const [[x0, y0], [x1, y1]] = selection;
    const cx = xScale(commit.date);
    const cy = yScale(commit.hourFrac);
    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
    }

    function renderSelectionCount(selection) {
        const selectedCommits = selection
            ? commits.filter((d) => isCommitSelected(selection, d))
            : [];

        const countElement = document.getElementById('selection-count');
        countElement.textContent = `${
            selectedCommits.length || 'No'
        } commits selected`;

        return selectedCommits;
    }

    function renderLanguageBreakdown(selection) {
        const selected = selection
            ? commits.filter((d) => isCommitSelected(selection, d))
            : [];

        const container = document.getElementById('language-breakdown');
        if (!selected.length) {
            container.innerHTML = '';
            return;
        }

        const lines = selected.flatMap((d) => d.lines);

        const breakdown = d3.rollup(
            lines,
            (v) => v.length,
            (d) => d.type
        );

        container.innerHTML = '';
        for (const [language, count] of breakdown) {
            const proportion = count / lines.length;
            container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${d3.format('.1~%')(proportion)})</dd>
            `;
        }
    }

    function brushed(event) {
        const selection = event.selection;
        d3.selectAll('circle').classed('selected', (d) =>
            isCommitSelected(selection, d),
        );
        renderSelectionCount(selection);
        renderLanguageBreakdown(selection);
    }

    // add brush group
    const brush = d3.brush()
      .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
      .on('start brush end', brushed);

    svg.append('g')
      .attr('class', 'brush')
      .call(brush);

    svg.selectAll('.dots').raise();

    
}

function renderTooltipContent(commit) {
    
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (!commit) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.datetime.toLocaleString([], { hour: '2-digit', minute: '2-digit'});
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  if (isVisible) {
    tooltip.classList.add('visible');
  } else {
    tooltip.classList.remove('visible');
  }
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function createBrushSelector(svg) {
    svg.call(d3.brush().on('start brush end', brushed));
    svg.selectAll('circle').raise();
}

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);


