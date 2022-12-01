// Adding Sources
function load_layers() {
    // demographics
    map.addSource('income_variables', {
        type: 'vector',
        'url':'mapbox://caleb-thomas-smith.6u0vx6vk'
    });
    //console.log("income_variables source added");

    // var household_median_income_steps = ["#0D0887", 36309, "#5402A4", 51114, "#8C0AA6", 63074,"#BA338A", 76897, "#DC5C68", 89179, "#F58949", 107207, "#FFBD2B", 135951, "#F1FA22", 169732, "#ffffff",]

    map.addLayer({
        'id':'household_median_income',
        'type':'fill',
        'source':'income_variables',
        'source-layer': 'household_income_ACS-a65qvq',
        'paint': {"fill-color":
                ["step",
                ["get", "Median Household Income in past 12 months (inflation-adjusted dollars to last year of 5-year range)"],
                "#0D0887",
                36309,
                "#5402A4",
                51114,
                "#8C0AA6",
                63074,
                "#BA338A",
                76897,
                "#DC5C68",
                89179,
                "#F58949",
                107207,
                "#FFBD2B",
                135951,
                "#F1FA22",
                169732,
                "#ffffff",
              ],
            'fill-opacity': 0.5
            },
        'layout': {
            'visibility': 'none',
        }
    });
    //console.log("household_median_income layer added");

    map.addSource('poverty_variables', {
        type: 'vector',
        'url':'mapbox://caleb-thomas-smith.8k3v0exw'
    });
    //console.log("poverty_variables source added");

    map.addLayer({
        'id':'householdPovertyRate',
        'type':'fill',
        'source':'poverty_variables',
        'source-layer': 'percent_poverty_ACS-dw0kqd',
        'paint': {"fill-color":
            [
                "step",
                ["get", "Percent of Population whose income in the past 12 months is below poverty level"],
                "#0D0887",
                10,
                "#5402A4",
                20,
                "#8C0AA6",
                30,
                "#BA338A",
                40,
                "#DC5C68",
                50,
                "#F58949",
                60,
                "#FFBD2B",
                70,
                "#ffffff",
              ]
        },
        'layout': {
            'visibility': 'none',
        }
    });
    //console.log("householdPovertyRate layer added");

    map.addSource('ithacaZoning', {
        type: 'vector',
        'url':'mapbox://caleb-thomas-smith.3kf86hj7'
    });
    //console.log("ithacaZoning source added");

    map.addLayer({
        'id':'ithacaZoning',
        'type':'fill',
        'source':'ithacaZoning',
        'source-layer': 'ithacazoningdistricts_adu_dat-9vwyge',
        'paint': {
            'fill-color': [
                'match',
                ['get', 'Accessory Dwelling Unit (ADU) Treatment'],
                'Overlay', 'white',
                "Prohibited", 'red',
                'Public Hearing', 'yellow', 'white'
            ],
        },
        'layout': {
            'visibility': 'none',
        }
    });
    //console.log("ithacaZoning layer added");

    map.addSource('newHavenZoning', {
        type: 'vector',
        'url':'mapbox://caleb-thomas-smith.80cd5hgo'
    });
    //console.log("newHavenZoning source added");

    map.addLayer({
        'id':'newHavenZoning',
        'type':'fill',
        'source':'newHavenZoning',
        'source-layer': 'newhaven_zoningdistricts_adu_-1fqab9',
        'paint': {
            'fill-color': 'red',
        },
        'layout': {
            'visibility': 'none',
        }
    });
    //console.log("newHavenZoning layer added");

    map.addSource('newHavenParcels', {
        type: 'vector',
        'url':'mapbox://caleb-thomas-smith.6ha5dykl'
    });
    //console.log("newHavenParcels source added");

    map.addLayer({
        'id':'newHavenParcels',
        'type':'fill',
        'source':'newHavenParcels',
        'source-layer': 'newhaven_final_parcels_v2_eps-2mejr1',
        'paint': {
            'fill-color': 'red',
        },
        'layout': {
            'visibility': 'none',
        }
    });
    //console.log("newHavenParcels layer added");

    map.addSource('ithacaParcels', {
        type: 'vector',
        'url':'mapbox://caleb-thomas-smith.6bjts4hy'
    });
    //console.log("ithacaParcels source added");

    map.addLayer({
        'id':'ithacaParcels',
        'type':'fill',
        'source':'ithacaParcels',
        'source-layer': 'ithaca_final_parcels_v2_epsg4-abexn9',
        'paint': {
            'fill-color': 'red',
        },
        'layout': {
            'visibility': 'visible',
        }
    });
    // console.log("ithacaParcels layer added");


//console.log("All Layers Loaded");
}
