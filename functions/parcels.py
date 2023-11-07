from shapely.geometry import Polygon, LineString, MultiLineString, Point, MultiPoint, MultiPolygon
from shapely.strtree import STRtree
from typing import List, Sequence, Any, Tuple, Union
import pyproj
from pyproj import Geod, Transformer

class Parcel(Polygon):
    def __init__(self, polygons, parcel_id, owner_name=None, address=None, zoning=None, source_crs="EPSG:4326", **kwargs):
        super().__init__(polygons, **kwargs)
        self.parcel_id = parcel_id
        self.owner_name = owner_name
        self.address = address
        self.zoning = zoning
        self.source_crs = source_crs
        self.edge_attributes = {}
        self.initialize_edges()

    def initialize_edges(self):
        # Extract edges from the exterior ring and store them as LineString objects
        if self.is_valid and self.exterior is not None:
            coords = list(self.exterior.coords)
            self.edges = [LineString([coords[i], coords[i+1]]) for i in range(len(coords) - 1)]
            self.calculate_and_set_bearings()
        else:
            raise ValueError("Invalid polygon.")

    def calculate_and_set_bearings(self):
        for i, edge in enumerate(self.edges):
            bearing = self.calculate_rhumb_bearing(edge.coords[0], edge.coords[1])
            self.set_edge_attribute(i, 'bearing', bearing)

    def calculate_rhumb_bearing(self, pt1: Tuple[float, float], pt2: Tuple[float, float]) -> float:
        geod = Geod(ellps="WGS84")
        transformer = Transformer.from_crs(self.source_crs, "EPSG:4326")
        lon1, lat1 = transformer.transform(pt1[1], pt1[0])
        lon2, lat2 = transformer.transform(pt2[1], pt2[0])
        angle, _, _ = geod.inv(lon1, lat1, lon2, lat2)
        bearing = (angle + 180) % 360 - 180
        return bearing

    def set_edge_attribute(self, edge_index, attribute, value):
        """Set an attribute to a specific edge."""
        if edge_index < len(self.edges):
            edge_wkt = self.edges[edge_index].wkt
            if edge_wkt not in self.edge_attributes:
                self.edge_attributes[edge_wkt] = {}
            self.edge_attributes[edge_wkt][attribute] = value
        else:
            raise IndexError("Edge index out of range.")
    
    def get_edge_attribute(self, edge_index, attribute):
        """Retrieve an attribute from a specific edge."""
        if edge_index < len(self.edges):
            return self.edge_attributes[self.edges[edge_index].wkt].get(attribute, None)
        else:
            raise IndexError("Edge index out of range.")
        
    def get_all_edges_with_attributes(self):
        """Return a list of dictionaries with edges and their attributes."""
        edges_info = []
        for edge in self.edges:
            edge_info = {
                'wkt': edge.wkt,
                'coordinates': list(edge.coords),
                'attributes': self.edge_attributes[edge.wkt]
            }
            edges_info.append(edge_info)
        return edges_info
        
    def description(self):
        desc = f"Parcel Details:\n"
        desc += f"  - Owner: {self.owner_name if self.owner_name else 'Unknown'}\n"
        desc += f"  - Parcel ID: {self.parcel_id}\n"
        desc += f"  - Address: {self.address if self.address else 'Unknown'}\n"
        desc += f"  - Zoning: {self.zoning if self.zoning else 'Unknown'}"
        print(desc)

    def nearest_road_segments(self, tree: STRtree, road_dicts: List[dict], n: int = 5) -> Sequence[Any]:
        # Get the centroid of the parcel's geometry
        centroid = self.centroid

        # Use STRtree to find the nearest road segments to the centroid
        nearest_geoms = tree.query(centroid)[:n]
        
        # Find the dictionaries corresponding to the nearest geometries
        nearest_segments = [road for road in road_dicts if road['geometry'] in nearest_geoms]
        
        return nearest_segments