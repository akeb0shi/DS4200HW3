// Load the Iris data from the CSV file
d3.csv("iris.csv").then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;

    });

    // Define the dimensions and margins for the box plot
    const margin = {top: 20, right: 30, bottom: 40, left: 50};
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container for the box plot
    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "white")

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
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Species");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .style("text-anchor", "middle")
        .text("Petal Length");

    // Define rollup function to calculate quartiles
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        // const iqr = q3 - q1;
        return { q1, median, q3 };
    };


    // Grouping the data by species and then calculating the quartiles for each species using rollup
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // Iterating through the result of rollup 
    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScale(species);
        const boxWidth = xScale.bandwidth();

        // Calculate lower and upper whiskers
        const lowerWhisker = Math.max(quartiles.q1 - 1.5 * quartiles.iqr, d3.min(data, d => d.PetalLength));
        const upperWhisker = Math.min(quartiles.q3 + 1.5 * quartiles.iqr, d3.max(data, d => d.PetalLength));

        // Draw the vertical lines (whiskers)
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(lowerWhisker))
            .attr("y2", yScale(upperWhisker))
            .attr("stroke", "black");

        // Draw the rectangle for the box
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))  // Start at Q3
            .attr("width", boxWidth)
            .attr("height", Math.abs(yScale(quartiles.q1) - yScale(quartiles.q3)))  // Box height from Q1 to Q3
            .attr("fill", "#69b3a2")
            .attr("stroke", "black");

        // Draw the median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.median))
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "black");
    });
});
