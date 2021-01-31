
  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *              Initialize the visualization               *
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

d3.json("/samples").then(function(response)  {
  // Select the input element and get the raw HTML node
  // get reference to drop down
  var ddElement = d3.select("#selDataset");

  // get id values for dropdown options
  var idOptions = Object.values(response)[2].map(d => d.id).flat(1);
  idOptions.sort((a,b) => (a-b));

  //loop through array of IDs and create new DOM node for each and append
  idOptions.forEach(id => {
    ddElement
      .append("option")
      .text(id)
      .property('value', id);
  });    

  var firstId = idOptions[0];
  buildCharts(firstId);
  buildMetadata(firstId);

}); 
  
  
  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *              buildCharts() function                     *
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function buildCharts(sample) {
  d3.json("/samples").then(function(response)  {
    var sampleData =  response.samples;
    console.log(sampleData);
    var resultArray = sampleData.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    
    var otu_ids = result.otu_ids;
    var otu_labels = result.otu_labels;
    var sample_values = result.sample_values;

    
    /********* Bubble Chart **********/
    var bubbleLayout = {
      title: `Bacteria Cultures Per Sample: ${sample}`,
      xaxis: { title: 'OTU ID'}
    };

    var bubbleData = [
      {
        x: otu_ids,
        y: sample_values,
        mode: 'markers',
        marker: {
          size: sample_values,
          color: otu_ids,
          colorscale: 'Earth'
        }
      }
    ];

    Plotly.newPlot('bubble', bubbleData, bubbleLayout);

    /********* Bar Chart **********/
    //get top 10 for sample    

    //make sure you reverse values and labels too
    var barData = [
      {
        y: otu_ids.slice(0, 10).map(otuID => `OTU ${otuID}`).reverse(),
        x: sample_values.slice(0, 10).reverse(),
        text: otu_labels.slice(0, 10).reverse(),
        type: 'bar',
        orientation: 'h'
      }
    ];

    var barLayout = {
      title: `Top 10 Belly Button Microbial Samples for Subject: ${sample}`,
      margin: { t: 30, l: 150 },
      xaxis: {'title': 'Sample Values'},
      yaxis: {'title': 'OTU ID'}
    };

    Plotly.newPlot('bar', barData, barLayout);
  });
};

 /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *              buildMetadata() function                     *
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function buildMetadata(sample) {
  d3.json("/samples").then(function(response)  {
    var metadata = response.metadata;

    //Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];

    // use d3 to select element with id of #sample-metadata
    var PANEL = d3.select('#sample-metadata');

    //use '.html('') to clear any existing metadata
    PANEL.html('');

    //use Object.entries to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    //tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append('h6').text(`${key.toUpperCase()}: ${value}`);
    });
    
    //Build the Gauge Chart since we pull out wash frequency from metadata
    wash_frequency = result.wfreq;
    buildGauge(wash_frequency);

  });
};

 /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *              buildGauge() function                      * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
 function buildGauge(wash_frequency) {

  var data = [
    {
      type: "indicator",
      mode: "gauge+number",
      value: wash_frequency,
      title: { 
        text: "Weekly Wash Frequency", 
        font: { size: 18 }
      },
      gauge: {
        axis: { 
          range: [null, 10], 
          tickwidth: 1,
          tickcolor: "darkblue"
        },
        bar: { color: "darkblue" },
        bgcolor: "white",
        borderwidth: 2,
        bordercolor: "gray",
        steps: [
          { range: [0, 10],
            color: "lavender"
          },
        ]
      }
    }
  ];

  var layout = {
    width: 300,
    height: 250,
    margin: { t: 25, r: 25, l: 25, b: 25 },
    font: { size: 12 }
  };

  var GAUGE = d3.select('#gauge').node();

  Plotly.newPlot(GAUGE, data, layout);

};

 /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *              optionChanged() function                   * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function optionChanged(newSample) {
  //Fetch new data each time a new sample from dropdown is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

/*


    // Input fields  trigger a change event 
    ddElement.on("change", function() {
      // Get the value property of the dropdown element
      var newId = d3.event.target.value;

      // filter on selection
      var filteredData = sampleData.filter(d => d.id == newId)
      console.log("FILTERED Data ----")
      console.log(filteredData[ 0])
      

      var filteredEntries = Object.entries(filteredData[0]).slice(1,4);
      console.log("filtered entries ----");
      console.log(filteredEntries);
      console.log(Object.values(filteredData[0]));

      var output = filteredEntries.map(([key, valueArray]) => {
        console.log("value array ----")
        console.log(valueArray);
        console.log(key);
        valueArray.forEach(value => {
          ({key, value})
        })
      });
      console.log(output);

      // convert into array of objects
      var dataArray = [];
      Object.keys(filteredData).forEach(key => {
        var obj = {};
        obj[key] = filteredData[key];
        dataArray.push(obj);
      });
      console.log(dataArray);





      //sort on sample values and get top 10
      var sortedData = filteredData[0].sort((a, b) => a.sample_values - b.sample_values);
      var slicedData = sortedData.slice(0,10);
      console.log("sliced Data ----");
      console.log(slicedData);

      //get values for trace
      var sampleValues = slicedData.map(d => d.sample_values).flat(1);
      var sampleIds = slicedData.map(d => d.otu_ids).flat(1);
      sampleIds = sampleIds.map(d => `OTU ${d}`);
      var sampleLabels = slicedData.map(d => d.otu_labels).flat(1);

      buildChart(newId, sampleIds, sampleValues, sampleLabels);
      
    });
    
    function buildChart(newId, sampleIds, sampleValues, sampleLabels) {
      var trace = [{
        'y': sampleIds,
        'x': sampleValues,
        'text': sampleLabels,
        'type': 'bar',
        'orientation': 'h'
      }];

      var layout = {
        title: `Top 10 Belly Button Microbial Samples for Subject: ${newId}`,
        xaxis: {
          title: "Sample Values"
        },
        yaxis: {
          title: "OTU IDs"
        }
      };

      Plotly.newPlot("bar", trace, layout);
    };

  });
}

/*
   Hints: Create additional functions to build the charts,
          build the gauge chart, set up the metadata,
          and handle the event listeners

   Recommended function names:
    optionChanged() 
    buildChart()
    buildGauge()
    buildMetadata()
*/
