// Set up margins and canvas size
const margin = {top: 20, right: 30, bottom: 40, left: 40};
const width = 500 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Set up the SVG canvas in the #boxplot div
const svg = d3.select("#boxplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the data (adjust the path if necessary)
d3.csv("path_to_your_file.csv").then(data => {
    // Convert the data: strings to numbers and handle species correctly
    data.forEach(d => {
        d.PetalLength = +d.PetalLength;
        d.Species = d.Species.trim();  // Ensure no extra whitespace in species names
    });

    // Scales
    const xScale = d3.scaleBand()
        .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.PetalLength)]) // Adjust the domain if necessary
        .range([height, 0]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Helper function to calculate quartiles and IQR
    function rollupFunction(values) {
        values.sort((a, b) => a.PetalLength - b.PetalLength); // Sort by PetalLength

        const q1 = d3.quantile(values, 0.25, d => d.PetalLength);
        const median = d3.quantile(values, 0.5, d => d.PetalLength);
        const q3 = d3.quantile(values, 0.75, d => d.PetalLength);
        const iqr = q3 - q1;

        return {q1: q1, median: median, q3: q3, iqr: iqr};
    }

    // Calculate quartiles by species
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // Draw the boxplots
    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScale(species);
        const boxWidth = xScale.bandwidth();

        // Vertical line (whiskers)
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.q1 - 1.5 * quartiles.iqr))
            .attr("y2", yScale(quartiles.q3 + 1.5 * quartiles.iqr))
            .attr("stroke", "black");

        // Box (from q1 to q3)
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("fill", "lightgray");

        // Median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.median))
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "black");
    });
});
