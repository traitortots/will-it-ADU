mapboxgl.accessToken = 'pk.eyJ1IjoiY2FsZWItdGhvbWFzLXNtaXRoIiwiYSI6ImNsNXY2aTVvODAxcHgzY204Y3VtaXdvbDgifQ.ymP724CF_-YRwPfKRN7_GA';


const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/caleb-thomas-smith/clb244lbq000114pbspzkxpja',
    center: [-76.49970, 42.44122],
    zoom: 12.45,
    pitch: 46.50,
    bearing: -16.80
});

var active_layer = "household_median_income";

// Adjusts the borders of the active layer when it is clicked
function adjust_active_layer(clickedLayer, property_types) {

    console.log(clickedLayer);

    map.on('mousemove', (event) => {
        const boundaries = map.queryRenderedFeatures(event.point, {
        layers: [clickedLayer]
        });
        document.getElementById('hover').innerHTML = boundaries.length
        ? `<p><strong><em>${boundaries[0].properties[property_types[clickedLayer]]}</strong> units</em></p>`
        : `<p>Hover over an area!</p>`;
        });
}

// Checks to see if the layers in the array were properly loaded on the map
function layers_exist(layer_list) {
    for (i = 0; i < layer_list.length; i++) {
        if (!map.getLayer(layer_list[i])) {
            return false;
        }
    }

    return true;
}

// given a group, makes that group visible and the others invisible
function make_visible(storyLayer) {
    console.log("make_visible called for " + storyLayer);
    to_remove = []

    for (let i = 0; i < storyLayer.length; i++) {
        let layer = storyLayer;
        let visibility = map.getLayoutProperty(
            layer,
            'visibility'
        );

        if(visibility != 'none') {
            to_remove.push(layer);
        }
    }
    make_invisible(to_remove);

    for (let i = 0; i < storyLayer.length; i++) {
        let layer = storyLayer;

        map.setLayoutProperty(
            layer,
            'visibility',
            'visible'
        );
        map.moveLayer(
            layer,
            // 'placeholder'
        );
    }
}

// // given a group, makes that group invisible
function make_invisible(storyLayer) {
    for (let i = 0; i < storyLayer.length; i++) {
        map.setLayoutProperty(
            storyLayer[i],
            'visibility',
            'none'
        );
    }
}

// legend creator options
function singleColorLegend(activeLayer) {

}

function stepColorLegend(activeLayer) {

}

function matchColorLegend(activeLayer) {

}

function legendCreator(activeLayers) {
// if regex ... do ...
// elif regex ... do...
// else ... do ...
}

// Wait until the map has finished loading.
map.on('load', () => {
    load_layers();

    // const initialLayers = ['household_median_income'];
    // array = []

    // make_visible(initialLayers)

    // Load layers of data
    map.setLayoutProperty('householdPovertyRate', 'visibility', 'none');
    map.setLayoutProperty('ithacaZoning', 'visibility', 'none');
    map.setLayoutProperty('newHavenZoning', 'visibility', 'none');
    map.setLayoutProperty('newHavenParcels', 'visibility', 'none');
    map.setLayoutProperty('ithacaParcels', 'visibility', 'none');

    map.getCanvas().style.cursor = 'default';

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());
    
});


// map.on('styledata', () => { // create legend - SINGLE COLOR
//     // destroy all existing layer entries
//     const legendBox = document.getElementById('activeContent');
//     legendBox.textContent = '';
    
//     // create the legend 
//     const activeLayers = map.getStyle().layers.filter((d) => d.layout?.visibility === "visible");

//     activeLayers.forEach((activeLayer) => {
//         const color = activeLayer.paint['fill-color'];
//         const legendItem = document.createElement("div");
//         const key = document.createElement("span");
//         key.className = "legend-key flex";
//         legendItem.className = "ui segment";
//         key.style.backgroundColor = color;

//         const activeContent = document.getElementById('activeContent');

//         const label = document.createElement("span");
//         label.innerHTML = `${activeLayer.id}`;
//         label.className = "legend";
//         legendItem.appendChild(key);
//         legendItem.appendChild(label);
//         activeContent.appendChild(legendItem);
//         console.log("legend created for " + activeLayer.id);
//     });
// })

map.on('styledata', () => { // create legend - MULTIPLE COLORS
    // destroy all existing layer entries
    const legendBox = document.getElementById('activeContent');
    legendBox.textContent = '';

    // create the legend
    const activeLayers = map.getStyle().layers.filter((d) => d.layout?.visibility === "visible");
    console.log("activeLayers is", activeLayers);

    activeLayers.forEach((activeLayer) => {
        const fillColorObj = activeLayer['paint']['fill-color'];
        const colorsList = fillColorObj.slice(2,-1);

        const legendItem = document.createElement("div");

        // colorsList.forEach((color) => {
        for (let i = 0; i < colorsList.length; i = i + 2) {
            const [hexCode,labelValue] = colorsList.slice(i, i + 2);
            const legendSubItem = document.createElement("div");
            const key = document.createElement("span");
            key.className = "legend-key flex";
            legendSubItem.className = "ui segment";
            key.style.backgroundColor = hexCode;

            const activeContent = document.getElementById('activeContent');

            const label = document.createElement("span");
            label.innerHTML = "< " + labelValue.toLocaleString(undefined, {maximumFractionDigits: 0});
            label.className = "legend";
            legendSubItem.appendChild(key);
            legendSubItem.appendChild(label);
            activeContent.appendChild(legendSubItem);

        };
    });
});

// // After the last frame rendered before the map enters an "idle" state.
map.on('idle', () => {
    // Enumerate ids of the layers.
    const toggleableLayerIDs = ['household_median_income','householdPovertyRate', 'ithacaZoning', 'newHavenZoning', 'newHavenParcels', 'ithacaParcels', 'ithacaHousing', 'newHavenHousing', 'newHavenAttached'];
    
    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIDs) {

        // skip layers that already have a button
        if (document.getElementById(id)) {
            // console.log("skipping " + id);
            continue;
        }

        // Create a link.
        const link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = id;
        link.className += ' item';

        // Show or hide layer when the toggle is clicked.
        link.onclick = function (e) {
            const clickedLayer = this.textContent;
            e.preventDefault();
            e.stopPropagation();

            const visibility = map.getLayoutProperty(
                clickedLayer,
                'visibility'
            );

            // toggle layer visibility by changing the layout object's visibility property
            if (visibility === 'visible') {
                map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                this.className += 'item';
            } else {
                this.className = 'item active';
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
            }
        };

            const layers = document.getElementById('layersList');
            layers.appendChild(link);
            console.log("added link: " + link);
        }
    });



    // // If these layers were not added to the map, abort
    // if (!layers_exist(blk_group) || !layers_exist(wei_group) || !layers_exist(ce_group)) {
    //     console.log("aborting");
    //     return;
    // }


    // $(document).ready(function(){
    //     $('.ui.accordion').accordion()

    //     $('.toggle').click(function(){
    //         $('.ui.accordion').accordion('toggle', 0);
    //     });

    //     $('input[type="radio"]').click(function(){
    //         if($(this).is(":checked")){
    //             let name = this.getAttribute("id");
    //             console.log("attribute ID is " + name)
    //             let group = layer_mapping[name];
    //             console.log("layer returned is " + group)
    //             console.log("assigning in radio buttons")
    //             active_layer = name;
    //             make_visible(group, results_layers);
    //             adjust_active_layer(this, property_types);
    //         }
    //     });

    //     $('input[type="checkbox"]').click(function(){
    //         let name = this.getAttribute("id");
    //         let group = layer_mapping[name];
    //         let none = []

    //         if($(this).is(":checked")){
    //             if(name == "commdist") {
    //                 map.setLayoutProperty(
    //                     'comm_area',
    //                     'visibility',
    //                     'visible'
    //                 );
    //             } else {
    //                 make_visible(group, none);
    //             }
    //         } else if($(this).is(":not(:checked)")){
    //             if(name == "commdist") {
    //                 map.setLayoutProperty(
    //                     'comm_area',
    //                     'visibility',
    //                     'none'
    //                 );
    //             } else {
    //                 make_invisible(group);
    //             }
    //         }
    //     });
    // });

    // map.on('mousemove', (event) => {
    //     if (active_layer == 'blk_group') {
    //         active_layer = 'bge_data'
    //     } else if (active_layer == 'wei_group') {
    //         active_layer = 'wei_data'
    //     } else if (active_layer == 'ce_group') {
    //         active_layer = 'ce_data'
    //     }

    //     const boundaries = map.queryRenderedFeatures(event.point, {
    //     layers: layer_mapping[active_layer]
    //     });

    //     console.log("active layer " + active_layer);
    //     value = boundaries[0].properties[property_types[active_layer]]

    //     if (value == undefined) {
    //         value = "No Data"
    //     } else {
    //         value = Math.floor(value * 100);
    //         value = String(value).concat("%");
    //     }

    //     if (active_layer == 'bge_data') {

    //         if (value == "No Data") {
    //             document.getElementById('hover').innerHTML = boundaries.length
    //             ? `<p>No Data</p>`
    //             : `<p>Hover over an area!</p>`;
    //         } else {
    //             document.getElementById('hover').innerHTML = boundaries.length
    //             ? `<p>There's a <strong><em>${value}</strong></em> chance that two people living in this tract are different races</p>`
    //             : `<p>Hover over an area!</p>`;
    //         }
    //     } else if (active_layer == 'wei_data') {

    //         if (value == "No Data") {
    //             document.getElementById('hover').innerHTML = boundaries.length
    //             ? `<p>No Data</p>`
    //             : `<p>Hover over an area!</p>`;
    //         } else {
    //             document.getElementById('hover').innerHTML = boundaries.length
    //             ? `<p>There's a <strong><em>${value}</strong></em> chance that two people who have potentially interacted in this tract are different races</em></p>`
    //             : `<p>Hover over an area!</p>`;
    //         }
    //     } else if (active_layer == 'ce_data') {

    //         if (value == "No Data") {
    //             document.getElementById('hover').innerHTML = boundaries.length
    //             ? `<p>No Data</p>`
    //             : `<p>Hover over an area!</p>`;
    //         } else {
    //             document.getElementById('hover').innerHTML = boundaries.length
    //             ? `<p>There's a <strong><em>${value}</strong></em> chance that two people who have visited this tract are different races</p>`
    //             : `<p>Hover over an area!</p>`;
    //         }
    //     }