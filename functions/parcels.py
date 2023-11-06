from shapely.geometry import Polygon, LineString, MultiLineString, Point, MultiPoint, MultiPolygon
from shapely.strtree import STRtree
from typing import List, Sequence, Any

class Parcel(Polygon):
    def __init__(self, polygons, parcel_id, owner_name=None, address=None, zoning=None, **kwargs):
        super().__init__(polygons, **kwargs)
        self.parcel_id = parcel_id
        self.owner_name = owner_name
        self.address = address
        self.zoning = zoning

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