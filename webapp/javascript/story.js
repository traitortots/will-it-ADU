// Story
var pageNum = 1;
var backButton = d3.select("#story-back");
var forwardButton = d3.select("#story-forward");
var pageNumbers = d3.select("#storymode-controls-numbers");
var storyHeader = d3.select("#story-header");
var storyContent = d3.select("#story-text");

var stories = [

    // layers: ['wei_data', 'ce_data', 'bge_data', 'comm_area', 'landuse', 'gentrification'];

    { title: "A New Picture of Segregation",
      description: "How do we understand racial segregation? Traditionally, we think about racial segregation in terms of neighborhoods - where people live.\
      A New Picture of Segregation describes a different way of thinking about segregation.\
      We account for the other spaces and opportunities that make up our daily social exposures.",
      layer: "wei_data",
      flyTo: {
        zoom: 11.32,
        pitch: 36.72,
        center: [-87.76359, 41.68604],
        bearing: 0
      },
    },
    { title: "Story 2",
      description: "Text text.",
      layer: "ce_data",
      flyTo: {
        zoom: 12.32,
        pitch: 26.72,
        center: [-87.76331, 41.73067],
        bearing: 88
      },
    },
    { title: "Story 3",
      description: "Text text text.",
      layer: "ce_data",
      flyTo: {
        zoom: 19.41,
        pitch:53.26,
        center: [-87.72640, 41.90855],
        bearing: 25.99
      },
    },
]

// Function to update the active layer

// Update Story.
function updateStory(storyObj) {

    // Story vars.
    var title = storyObj['title'];
    var description = storyObj['description'];
    var cameraSettings = storyObj['flyTo'];
    // var layer = storyObj['layer'];

    // Update the Storymode content.
    storyHeader.text(title);
    storyContent.text(description);
    map.flyTo(cameraSettings);
    // call to update to active layer
};

// Callbacks
// Story mode click through FORWARD.
backButton.on("click", function () {

    // Update the Navigation bottom panel.
    pageNum = pageNum - 1;
    pageNumbers.text(pageNum + " of " + stories.length);
    backButton.style( "visibility", (pageNum == 1) ? "hidden" : "visible" );
    forwardButton.style( "visibility", (pageNum == stories.length) ? "hidden" : "visible" );

    // Update the story.
    updateStory(stories[pageNum-1]);
});

  // Story mode click through BACKWARD.
forwardButton.on("click", function () {

    // Update the Navigation bottom panel.
    pageNum = pageNum + 1;
    pageNumbers.text(pageNum + " of " + stories.length);
    backButton.style( "visibility", (pageNum == 1) ? "hidden" : "visible" );
    forwardButton.style( "visibility", (pageNum == stories.length) ? "hidden" : "visible" );

    // Update the story.
    updateStory(stories[pageNum-1]);
});
