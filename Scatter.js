// Load the Iris data from the CSV file
d3.csv("iris.csv").then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Scatter plot
    const margin = {top: 20, right: 30, bottom: 40, left: 50};
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container for the scatter plot
    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 1, d3.max(data, d => d.PetalLength) + 1])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 0.5, d3.max(data, d => d.PetalWidth) + 0.5])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(["setosa", "versicolor", "virginica"])
        .range(d3.schemeCategory10);

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add circles for each data point
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("r", 5)
        .style("fill", d => colorScale(d.Species));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Petal Length");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .style("text-anchor", "middle")
        .text("Petal Width");

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
});
