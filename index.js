d3.json('orders.json').then(function (data) {
  const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');
  const ganttData = data.map(function (order) {
    const operations = order.operations.map(function (operation) {
      return {
        name: operation.name,
        startTime: parseTime(order.schedule),
        duration: parseInt(operation.compliance_rate),
      };
    });

    const endTime = operations.reduce(function (acc, operation) {
      return acc + operation.duration;
    }, 0);

    operations.forEach(function (operation) {
      operation.endTime = new Date(operation.startTime.getTime() + endTime);
    });

    return {
      name: order.name,
      operations: operations,
    };
  });

  const margin = { top: 50, right: 30, bottom: 30, left: 80 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const x = d3
    .scaleTime()
    .domain([
      d3.min(ganttData, function (order) {
        return d3.min(order.operations, function (operation) {
          return operation.startTime;
        });
      }),
      d3.max(ganttData, function (order) {
        return d3.max(order.operations, function (operation) {
          return operation.endTime;
        });
      }),
    ])
    .range([0, width]);

  const y = d3
    .scaleBand()
    .domain(
      ganttData.map(function (order) {
        return order.name;
      }),
    )
    .range([0, height])
    .padding(0.5);

  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  const svg = d3
    .select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg
    .selectAll('.bar')
    .data(ganttData)
    .enter()
    .append('g')
    .attr('class', 'bar')
    .attr('transform', function (order) {
      return 'translate(0,' + y(order.name) + ')';
    })
    .selectAll('rect')
    .data(function (order) {
      return order.operations;
    })
    .enter()
    .append('rect')
    .attr('x', function (operation) {
      return x(operation.startTime);
    })
    .attr('y', 0)
    .attr('width', function (operation) {
      return x(operation.endTime) - x(operation.startTime);
    })
    .attr('height', y.bandwidth())
    .attr('fill', 'steelblue');

  svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  svg.append('g').attr('class', 'y axis').call(yAxis);

  document.getElementById('applyFilterBtn').addEventListener('click', function () {
    const selectedValue = document.getElementById('filterSelect').value;
    applyFilter(selectedValue);
  });

  function applyFilter(filterValue) {
    svg.selectAll('.bar').remove();

    const filteredData = ganttData.filter(function (order) {
      const lastChar = order.name.slice(-1);
      return filterValue === 'all' || lastChar === filterValue;
    });

    svg
      .selectAll('.bar')
      .data(filteredData)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', function (order) {
        return 'translate(0,' + y(order.name) + ')';
      })
      .selectAll('rect')
      .data(function (order) {
        return order.operations;
      })
      .enter()
      .append('rect')
      .attr('x', function (operation) {
        return x(operation.startTime);
      })
      .attr('y', 0)
      .attr('width', function (operation) {
        return x(operation.endTime) - x(operation.startTime);
      })
      .attr('height', y.bandwidth())
      .attr('fill', 'steelblue');
  }
});
