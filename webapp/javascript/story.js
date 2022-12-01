// Story
var pageNum = 1;
var backButton = d3.select("#story-back");
var forwardButton = d3.select("#story-forward");
var pageNumbers = d3.select("#storymode-controls-numbers");
var storyHeader = d3.select("#story-header");
var storyContent = d3.select("#story-text");

var stories = [
    {
      title: "Welcome!",
      description: "Welcome text",
      flyTo: {
        center: [-76.49502, 42.44116],
        zoom: 12.43,
        pitch: 0.00,
        bearing: 0.00
      },
    },
    { title: "Neighborhood Context (Ithaca)",
      description: "In Ithaca, 73% of households are renters due to the large student community as a result of Cornell University and Ithaca College being situated in the city. Additionally, there is a low supply of housing in the city which has made existing properties very expensive and almost unreachable to the average family.The city is predominately white but with significant populations of African Americans in the West Hill neighborhoods of the city. In these neighborhoods, many residents are experiencing poverty and sharp structural racism at the hands of incompetent landlords. Ithaca population - 31,710 (2011)",
      layer: "household_median_income",
      flyTo: {
        center: [-76.49502, 42.44116],
        zoom: 12.43,
        pitch: 0.00,
        bearing: 0.00
      },
    },
    { title: "ADU Regulations",
      description: "Accessory Dwelling Units (ADUs). They can be defined as additional living quarters built inside the lots of single-family homes but house separate occupants from that of the primary dwelling unit. They can be attached or detached from the main residence and are often equipped with kitchen or bathroom facilities. Building more ADU’s can help tackle the housing crisis because they increase housing supply in a manner that is far more cost-effective than building a new single-family home in a single lot. They also build neighborhood wealth for everyday working-class Americans. Ignoring any regulations, approximately 4,827 new ADU’s can be build in Ithaca",
      layer: "ithacaParcels",
      flyTo: {
        center: [-76.49502, 42.44116],
        zoom: 15.5,
        pitch: 0.00,
        bearing: 0.00
      },
    },
    { title: "Where is housing allowed in Ithaca?",
      description: "The city of Ithaca is comprised of three types of zoning districts:  ‘Primarily Residential’, ‘Non-Residential’ and ‘Mixed with Residential’. If we take into account the fact that’ non-residential’ zoning districts do not allow ADU’s, our total number of possible ADU’s decreases to 4594.    ",
      layer: "ithacaHousing",
      flyTo: {
        center: [-76.49502, 42.44116],
        zoom: 13,
        pitch: 0.00,
        bearing: 0.00
      },
    },
    { title: "Where are ADU’s allowed?",
      description: "The Ithaca’s Zoning Ordinance designates which parcels allow ADU’s. Each parcel in the city is designated one of the following categories: ‘Overlay’, ‘Prohibited’ or ‘Public Hearing’. ‘Overlay’ and ‘Public Hearing’ both allow for the construction of ADU’s, whilst ‘Prohibited’ do not. Taking account of this, the total number of ADU’s is reduced even further to 4541 which is 5% decrease of the total number of ADU’s we had at the start . It is also important to note that the Ithaca zoning ordinance also has certain requirements for parcels that are allowed ADU’s. These requirements are as follows:   Owner Occupancy is required of the residential unit the ADU is built next to. All ADU units must have a minimum of 1 parking space additional to the main unit. ADU’s can only be no more than 33.3% of the size of the main unit.",
      layer: "ithacaZoning",
      flyTo: {
        center: [-76.49502, 42.44116],
        zoom: 13,
        pitch: 0.00,
        bearing: 0.00
      },
    },    
    // { title: "Housing Units",
    // description: "Despite these local regulations, the construction of ADU’s can have a remarkable impact on increasing the housing supply in the city. This map illustrates how each census tract gains a substantial amount of housing units when ADU’s are constructed",
    // layer: "ce_data",
    // flyTo: {
    //   center: [-76.50239, 42.42908],
    //   zoom: 12.94,
    //   pitch: 58.00,
    //   bearing: 26.40
    // },
    // },
    { title: "Downtown Ithaca",
    description: "This map shows the median household income in census tract 1 - Downtown Ithaca. In this census tract, the median household income is 36309. This figure is lower than the national average, indicating this is a lower income neighborhood. If a resident rents out a single ADU in their lot , they will be expected to make an extra $9600 every year. This will mean a substantial increase of 26% to their household income which could help them improve their quality of life.",
    layer: "household_median_income",
    flyTo: {
      center: [-76.49471, 42.43949],
      zoom: 14.92,
      pitch: 48.50,
      bearing: -71.27
    },
    },
    { title: "Neighborhood Context (New Haven)",
    description: "New Haven, on the other hand, is a far larger city that is also home to a large student population due to Yale University. It has some of the highest populations of Black, Indigenous, and Hispanic people in the entire state. These communities are often at the brunt of the expensive housing market and high costs of living. There is also a large disparity between the supply of housing to their demand. The increase in monthly rent for multifamily buildings is far greater than the growth in the production of these units. New Haven population - 135, 081 (2011) ",
    layer: "household_median_income",
    flyTo: {
      center: [-72.92723, 41.32440],
      zoom: 11.02,
      pitch: 14.00,
      bearing: -20.80
    },
    },
    { title: "ADUs in New Haven",
    description: "Ignoring local zoning regulations, approximately 26,517 ADU’s can be constructed in the city. If an ADU is built in the city, there are certain guidelines they must adhere to, they are as follows:   An ADU can only be built next to a main unit that has owner occupancy. The minimum size of an ADU in New Haven is 400 sq. ft whilst the maximum size is no more than 1200 square feet. The height of the ADU cannot be greater than that of the main structure",
    layer: "newHavenParcels",
    flyTo: {
      center: [-72.92767, 41.30805],
      zoom: 15.5,
      pitch: 42.50,
      bearing: -10.40
    },
    },
    { title: "Where is housing allowed in New Haven?",
    description: "The city of New Haven is comprised of three types of zoning districts:  ‘Primarily Residential’, ‘Non-Residential’ and ‘Mixed with Residential’. If we take into account the fact that’ non-residential’ zoning districts do not allow ADU’s, our total number of possible ADU’s decreases to 24,625.",
    layer: "newHavenHousing",
    flyTo: {
      center: [-72.92767, 41.30805],
      zoom: 12.50,
      pitch: 35.00,
      bearing: 28.00
    },
    },
    { title: "Where are ADUs allowed in New Haven?",
    description: "New Haven’s Zoning Ordinance designates which parcels allow ADU’s. Each parcel in the city is designated either ‘Allowed/Conditional’ or ‘Prohibited’. ‘Prohibited’ parcels do not allow for the construction of ADU’s. Taking account of this, the total number of ADU’s is reduced even further to 20,994.",
    layer: "newHavenZoning",
    flyTo: {
      center: [-72.92767, 41.30805],
      zoom: 12.50,
      pitch: 35.00,
      bearing: 28.00
    },
    },
    { title: "ADU Feasibility when factoring in primary structure regulation",
    description: "New Haven’s Zoning Ordinance contains special regulations for the Special Single Family and General Single Family zoning districts. In these districts, all ADU units must be connected to the primary structure. This means they cannot be constructed separately from the main unit. This results in a reduction of 8871 ADU’s in New Haven, meaning only 54% of all possible ADU’s can be constructed when we consider local regulations. ",
    layer: "newHavenAttached",
    flyTo: {
      center: [-72.92767, 41.30805],
      zoom: 12.50,
      pitch: 35.00,
      bearing: 28.00
    },
    },
    { title: "Median Income in Census Tract 1415",
    description: "This map shows the median household income across census tract 1415 in New Haven. In this census tract, the median household income is 29,066 .This figure is lower than the national average, indicating this is a lower income neighborhood. If a resident rents out a single ADU in their lot , they will be expected to make an extra $9600 every year. This will mean a substantial increase of 33% to their household income which could help them improve their quality of life.",
    layer: "household_median_income",
    flyTo: {
      center: [-72.93343, 41.31257],
      zoom: 14.24,
      pitch: 33.50,
      bearing: -17.60
    },
    },
  ]

// Function to update the active layer

// Update Story.
function updateStory(storyObj) {
    // turn off any active layers
    const allLayerIDs = ['household_median_income','householdPovertyRate', 'ithacaZoning', 'newHavenZoning', 'newHavenParcels', 'ithacaParcels'];
    for (const id of allLayerIDs) {
      const visibility = map.getLayoutProperty(id, 'visibility');

      if (visibility === 'visible') {
        map.setLayoutProperty(id, 'visibility', 'none');
      }
      else {
        continue;
      }
    }

    // Story vars.
    var title = storyObj['title'];
    var description = storyObj['description'];
    var cameraSettings = storyObj['flyTo'];
    var layer = storyObj['layer'];

    // Update the Storymode content.
    storyHeader.text(title);
    storyContent.text(description);
    map.flyTo(cameraSettings);
    make_visible(layer);
    console.log("updateStory called for " + title);
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