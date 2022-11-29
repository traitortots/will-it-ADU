mapboxgl.accessToken = 'pk.eyJ1IjoiaWFtd2Z4IiwiYSI6ImNqNGFnMnIyMzEwZzgycXJ1ODdqbG14eGMifQ.3AqBqXZlcbsbEhxddAPB-g';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ajchu28/cl2rubekr000214pswya10cpr',
    zoom: 11,
    center: [-87.623177, 41.881832]
});

var active_layer = "blk_group";

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
function make_visible(group, result_layers) {

    to_remove = []

    for (let i = 0; i < result_layers.length; i++) {
        let layer = result_layers[i];
        let visibility = map.getLayoutProperty(
            layer,
            'visibility'
        );

        if(visibility != 'none') {
            to_remove.push(layer);
        }
    }
    make_invisible(to_remove);

    for (let i = 0; i < group.length; i++) {
        let layer = group[i];

        map.setLayoutProperty(
            layer,
            'visibility',
            'visible'
        );
        map.moveLayer(
            layer,
            'placeholder'
        );
    }
}

// given a group, makes that group invisible
function make_invisible(group) {
    for (let i = 0; i < group.length; i++) {
        map.setLayoutProperty(
            group[i],
            'visibility',
            'none'
        );
    }
}

// Wait until the map has finished loading.
map.on('load', () => {
    load_layers();

    const blk_group = ['blkgrp_exp_results_1','blkgrp_exp_results_2','blkgrp_exp_results_3'];
    array = []

    make_visible(blk_group, array)


    // Load layers of data
    map.setLayoutProperty('bge_data', 'visibility', 'none');
    map.setLayoutProperty('ce_data', 'visibility', 'none');
    map.setLayoutProperty('wei_data', 'visibility', 'none');
    map.setLayoutProperty('comm_area', 'visibility', 'none');

    map.getCanvas().style.cursor = 'default';
});

// After the last frame rendered before the map enters an "idle" state.
map.on('idle', () => {
    // Enumerate ids of the layers.
    const blk_group = ['blkgrp_exp_results_1','blkgrp_exp_results_2','blkgrp_exp_results_3'];
    const wei_group = ['wei_results_1', 'wei_results_2', 'wei_results_3'];
    const ce_group = ['cell_exp_results_1','cell_exp_results_2','cell_exp_results_3'];
    const results_layers = [].concat(blk_group, wei_group, ce_group);
    const land_use = ['landuse_1', 'landuse_2', 'landuse_3', 'landuse_5', 'landuse_6', 'landuse_7', 'landuse_8', 'landuse_9', 'landuse_10', 'landuse_11', 'landuse_12', 'landuse_13', 'landuse_14', 'landuse_15']
    const gentrification = ['gentrification_0', 'gentrification_1', 'gentrification_2']

    const property_types = {
        'wei_data': 'weighted_interaction_exposure',
        'ce_data': 'cell_exp',
        'bge_data': 'blkgrp_exp',
        'comm_area': 'id',
    };

    const layer_mapping = {
        'wei_group': wei_group,
        'ce_group': ce_group,
        'blk_group': blk_group,
        'landuse': land_use,
        'gentrification': gentrification
    };

    // If these layers were not added to the map, abort
    if (!layers_exist(blk_group) || !layers_exist(wei_group) || !layers_exist(ce_group)) {
        console.log("aborting");
        return;
    }



    $(document).ready(function(){
        $('.ui.accordion').accordion()

        $('.toggle').click(function(){
            $('.ui.accordion').accordion('toggle', 0);
        });

        $('input[type="radio"]').click(function(){
            if($(this).is(":checked")){
                let name = this.getAttribute("id");
                let group = layer_mapping[name];
                console.log("assigning in radio buttons")
                active_layer = name;
                make_visible(group, results_layers);
                // adjust_active_layer(this, property_types);
            }
        });
        $('input[type="checkbox"]').click(function(){
            let name = this.getAttribute("id");
            let group = layer_mapping[name];
            let none = []

            if($(this).is(":checked")){
                if(name == "commdist") {
                    map.setLayoutProperty(
                        'comm_area',
                        'visibility',
                        'visible'
                    );
                } else {
                    make_visible(group, none);
                }
            } else if($(this).is(":not(:checked)")){
                if(name == "commdist") {
                    map.setLayoutProperty(
                        'comm_area',
                        'visibility',
                        'none'
                    );
                } else {
                    make_invisible(group);
                }
            }
        });
    });

    map.on('mousemove', (event) => {
        if (active_layer == 'blk_group') {
            active_layer = 'bge_data'
        } else if (active_layer == 'wei_group') {
            active_layer = 'wei_data'
        } else if (active_layer == 'ce_group') {
            active_layer = 'ce_data'
        }

        const boundaries = map.queryRenderedFeatures(event.point, {
        layers: layer_mapping[active_layer]
        });

        console.log("active layer " + active_layer);
        value = boundaries[0].properties[property_types[active_layer]]

        if (value == undefined) {
            value = "No Data"
        } else {
            value = Math.floor(value * 100);
            value = String(value).concat("%");
        }

        if (active_layer == 'bge_data') {

            if (value == "No Data") {
                document.getElementById('hover').innerHTML = boundaries.length
                ? `<p>No Data</p>`
                : `<p>Hover over an area!</p>`;
            } else {
                document.getElementById('hover').innerHTML = boundaries.length
                ? `<p>There's a <strong><em>${value}</strong></em> chance that two people living in this tract are different races</p>`
                : `<p>Hover over an area!</p>`;
            }
        } else if (active_layer == 'wei_data') {

            if (value == "No Data") {
                document.getElementById('hover').innerHTML = boundaries.length
                ? `<p>No Data</p>`
                : `<p>Hover over an area!</p>`;
            } else {
                document.getElementById('hover').innerHTML = boundaries.length
                ? `<p>There's a <strong><em>${value}</strong></em> chance that two people who have potentially interacted in this tract are different races</em></p>`
                : `<p>Hover over an area!</p>`;
            }
        } else if (active_layer == 'ce_data') {

            if (value == "No Data") {
                document.getElementById('hover').innerHTML = boundaries.length
                ? `<p>No Data</p>`
                : `<p>Hover over an area!</p>`;
            } else {
                document.getElementById('hover').innerHTML = boundaries.length
                ? `<p>There's a <strong><em>${value}</strong></em> chance that two people who have visited this tract are different races</p>`
                : `<p>Hover over an area!</p>`;
            }
        }
    });

});
