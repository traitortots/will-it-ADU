from shapely.geometry import Polygon, LineString, MultiLineString, Point, MultiPoint, MultiPolygon
from shapely.geometry.base import BaseGeometry
from shapely.strtree import STRtree
from shapely.ops import linemerge, unary_union, nearest_points
from shapely.affinity import translate, rotate
import math
import geopandas as gpd
from geopandas import GeoDataFrame
import pandas as pd
import matplotlib.pyplot as plt
from pyproj import Transformer
import pyproj
import numpy as np
from thefuzz import fuzz
from typing import List, Tuple
import traceback
from typing import List, Union, Optional, Tuple, Any

# Load the geojson file into a GeoDataFrame
parcels_gdf = gpd.read_file("Parcels_Public.geojson")

# Reproject the GeoDataFrame to EPSG:2906 in place
parcels_gdf = parcels_gdf.to_crs(epsg=2906)

parcels_gdf['throughlot'] = False
parcels_gdf['hasinteriorside'] = False
parcels_gdf['hasstreetside'] = False

def getlotlines(lot: Polygon, bearing: Optional[List[float]] = None) -> Union[bool, List[LineString]]:
    # Calculate the convex hull of the input lot using Shapely's convex_hull function
    parcel = lot.convex_hull
    print("Parcel convex hull: ", parcel)

    # Use the explodeLine function to get line segments for the convex hull
    parcel_line = explodeLine(parcel)
    print("Parcel convex hull lines: ", parcel_line)

    # Calculate rhumb bearings for each line segment
    parcel_bearing = [calculate_rhumb_bearing(list(line.coords[0]), list(line.coords[1])) for line in parcel_line]
    print("Parcel bearings: ", parcel_bearing)

    # Calculate the minimum rotated rectangle for the lot using Shapely's minimum_rotated_rectangle function
    min_rotated_rect = lot.minimum_rotated_rectangle
    print("Parcel min rect: ", min_rotated_rect)

    # Use the explodeLine function to get line segments for the minimum rotated rectangle
    bbox_line = explodeLine(min_rotated_rect)
    print("Parcel bbox lines: ", bbox_line)

    # Calculate rhumb bearings for the bounding box line segments
    if bearing is None:
        bbox_bearing = [calculate_rhumb_bearing(list(line.coords[0]), list(line.coords[1])) for line in bbox_line]
    else:
        bbox_bearing = bearing

    # Assign bearings to the bounding box bearings
    assignment = [assignbearing(parcel_bearing_item, bbox_bearing) for parcel_bearing_item in parcel_bearing]
    print("bbox bearing assignment: ", assignment)

    # Special case when the convex hull is 4-sided
    if len(parcel_line) <= 3:
        print("Convex hull has 3 or fewer sides:", parcel_line)
        return False

    # Simplify the parcel polygon
    parcel = parcel.simplify(0.000001, preserve_topology=True)
    print("Simplified parcel hull: ", parcel)

    # Perform cleanup of the simplified polygon
    geom = cleanupgon(parcel, 2) # dupe of shapely's simplify?
    # geom = parcel  # Use the simplified parcel directly
    print("cleanupgon'd parcel hull: ", geom)

    parcel = geom

    parcel_line = explodeLine(parcel)
    print("Parcel convex hull lines: ", parcel_line)

    parcel_bearing = [calculate_rhumb_bearing(list(line.coords[0]), list(line.coords[1])) for line in parcel_line]
    print("Parcel convex hull: ", parcel_bearing)

    min_rotated_rect = lot.minimum_rotated_rectangle
    print("Original Parcel min rect: ", min_rotated_rect)

    orig_bbox_line = explodeLine(min_rotated_rect)
    print("Original Parcel min rect lines: ", bbox_line)

    if bearing is None:
        orig_bbox_bearing = [calculate_rhumb_bearing(list(line.coords[0]), list(line.coords[1])) for line in orig_bbox_line][:2]
    else:
        orig_bbox_bearing = bearing
    print("Orig parcel min rect bearings: ", orig_bbox_bearing)

    # Assign bearings based on the cleaned-up polygon
    assignment = [assignbearing(parcel_bearing_item, orig_bbox_bearing) for parcel_bearing_item in parcel_bearing]
    print("Parcel convex hull: ", assignment)

    # Extract the lines and concavify them
    result = []
    extracted_lines = extract_lines(parcel_line, assignment)
    print("Extracted lines: ", extracted_lines)
    for line_group in extracted_lines:
        for line in line_group:
            concavified_line = concavify(line, lot)
            result.append(concavified_line)
    print("getlotlines Result:", result)
    return result

# adapted from https://gis.stackexchange.com/questions/436679/how-to-convert-polygons-to-line-segments-using-python
def explodeLine(poly: Polygon) -> List[LineString]:
    """A function to return all segments of a line as a list of linestrings"""
    coords = poly.exterior.coords #Create a list of all line node coordinates
    parts = []
    for part in zip(coords, coords[1:]): #For each start and end coordinate pair
        parts.append(LineString(part)) #Create a linestring and append to parts list
    return parts

# Function to calculate rhumb bearing between two points

Coordinate = Union[Tuple[float, float], List[float]]

def calculate_rhumb_bearing(
    pt1: Coordinate, 
    pt2: Coordinate, 
    source_crs: Union[str, pyproj.CRS] = source_crs
) -> float:
    geod = pyproj.Geod(ellps="WGS84")

    # Create a transformer to convert from the source CRS to EPSG:4326
    transformer = Transformer.from_crs(source_crs, "EPSG:4326")

    # Transform the coordinates to latitude and longitude
    lon1, lat1 = transformer.transform(pt1[1], pt1[0])
    lon2, lat2 = transformer.transform(pt2[1], pt2[0])

    angle, reverse_angle, distance = geod.inv(lon1, lat1, lon2, lat2)

    # Normalize the angle to the range -180 to 180
    bearing = (angle + 180) % 360 - 180
    return bearing

def assignbearing(bearing: float, reference: List[float]) -> int:
    m1 = min(abs(reference[0] - bearing), (180 - reference[0]) + bearing if bearing <= reference[0] else (180 - bearing) + reference[0])
    m2 = min(abs(reference[1] - bearing), (180 - reference[1]) + bearing if bearing <= reference[1] else (180 - bearing) + reference[1])
    return 0 if m1 <= m2 else 1

def concavify(line: LineString, lot: Polygon) -> LineString:
    start = line.coords[0]
    end = line.coords[-1]

    lot_coords = list(lot.exterior.coords)[:-1]
    double_lot_coords = lot_coords + lot_coords

    l1, l2 = [], []

    i = 0
    while i < len(double_lot_coords) and double_lot_coords[i] != start:
        i += 1
    while i < len(double_lot_coords) and double_lot_coords[i] != end:
        l1.append(double_lot_coords[i])
        i += 1
    l1.append(double_lot_coords[i])

    i = 0
    while i < len(double_lot_coords) and double_lot_coords[i] != end:
        i += 1
    while i < len(double_lot_coords) and double_lot_coords[i] != start:
        l2.append(double_lot_coords[i])
        i += 1
    l2.append(double_lot_coords[i])

    l1 = LineString(l1)
    l2 = LineString(l2)

    return l1 if l1.length <= l2.length else l2

def extract_lines(parcel_line: List[LineString], assignment: List[int]) -> List[List[LineString]]:
    # If all assignments are 0 or all assignments are 1, return an empty list
    if all(a == 0 for a in assignment) or all(a == 1 for a in assignment):
        return []

    # Rotate parcel_line and assignment so that the first and last assignments differ
    while assignment[0] == assignment[-1]:
        parcel_line = [parcel_line[-1]] + parcel_line[:-1]
        assignment = [assignment[-1]] + assignment[:-1]

    # Count the number of changes in assignment values along the polygon boundary
    value_changes = 0
    for i in range(1, len(assignment)):
        if assignment[i] != assignment[i - 1]:
            value_changes += 1

    # If there are less than 3 changes, return an empty list
    if value_changes < 3:
        return []

    # Duplicate parcel_line and assignment to avoid boundary issues when looping
    double_line = parcel_line + parcel_line
    double_assignment = assignment + assignment
    lotline = [[], []]  # Initialize lotline as a list containing two empty lists

    # Loop for two cases: assignment value 0 and assignment value 1
    for case in range(2):
        # Loop twice to extract two continuous line segments for each case
        for _ in range(2):
            # Find the first index with the current case value
            i = 0
            while i < len(double_assignment) and double_assignment[i] != case:
                i += 1

            # Collect line segments with the current case value
            line = []
            while i < len(double_assignment) and double_assignment[i] == case:
                line.append(double_line[i])
                i += 1

            # Convert line to a LineString object with coordinates from start to end
            line = [segment.coords[0] for segment in line] + [line[-1].coords[-1]]
            lotline[case].append(LineString(line))

    # Return the extracted line segments as a list of two groups (for assignment values 0 and 1)
    return lotline

def cleanupgon(poly, n=1):
    coords = list(poly.exterior.coords)[:-1]
    new_coords = []
    
    for i in range(len(coords)):
        pt1 = coords[i]
        pt0 = coords[i - 1] if i != 0 else coords[-1]
        pt2 = coords[0] if i == len(coords) - 1 else coords[i + 1]
        
        remove_pt1 = abs(slope(pt0, pt1, n) - slope(pt1, pt2, n)) <= _tolerance \
            and abs(slope(pt0, pt1, n) - slope(pt0, pt2, n)) <= _tolerance
        if not remove_pt1:
            new_coords.append(pt1)
    
    new_coords.append(new_coords[0])
    new_poly = Polygon(new_coords)
    return cleanupgon(new_poly) if len(new_coords) < len(coords) and len(new_coords) >= 4 else poly

def slope(x, y, n=None):
    z = (x[1] - y[1]) / (x[0] - y[0])
    return round(z, n) if n is not None else z

import matplotlib.pyplot as plt

# make this work
def test_getlotlines_debug():
    # Extract the test parcel with FID = 3641
    test_parcel = parcels_gdf.loc[parcels_gdf['FID'] == 3641].iloc[0]
    print("This is the test parcel: ", test_parcel['geometry'])

    # Call the getlotlines function with the geometry of the extracted parcel
    lot_lines = getlotlines(test_parcel['geometry'])

    # Check if the output is a list of tuples with the expected length
    assert isinstance(lot_lines, list), "Output should be a list"
    assert all(isinstance(item, tuple) and len(item) == 2 for item in lot_lines), "Each item in the list should be a tuple of length 2"

    # Print the coordinates of the parcel
    print("Parcel coordinates:", test_parcel['geometry'].exterior.coords[:])

    # Optionally, visualize the parcel and the generated lot lines
    fig, ax = plt.subplots()
    parcels_gdf[parcels_gdf['FID'] == 3641].plot(ax=ax, edgecolor='blue', linewidth=3, facecolor='none')
    for line, _ in lot_lines:
        x, y = line.xy
        ax.plot(x, y, color='red', linewidth=2)
    plt.show()

