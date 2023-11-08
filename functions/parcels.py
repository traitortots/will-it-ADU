from shapely.geometry import Polygon, LineString, MultiLineString, Point, MultiPoint, MultiPolygon
from shapely.strtree import STRtree
from typing import List, Sequence, Any, Tuple, Union
import pyproj
from pyproj import Geod, Transformer

class Parcel(Polygon):
    """
    A Parcel class that extends the functionality of a Shapely Polygon to represent
    land parcels with additional attributes and geometric analysis capabilities.

    Attributes:
        parcel_id (str): A unique identifier for the parcel.
        owner_name (str, optional): The name of the owner of the parcel.
        address (str, optional): The address of the parcel.
        zoning (str, optional): The zoning classification of the parcel.
        source_crs (str): The coordinate reference system of the parcel's points.
        edge_attributes (dict): A dictionary to hold attributes of the parcel's edges.
        mbr_edge_attributes (dict): A dictionary to hold attributes of the MBR's edges.
        edges (List[LineString]): The list of edges as LineString objects that make up the parcel.
        mbr_edges (List[LineString]): The list of edges as LineString objects that make up the MBR of the parcel.

    Methods:
        initialize_edges: Initializes the edges of the parcel and calculates their bearings.
        calculate_and_set_bearings: Calculates the bearings of the parcel's edges and stores them.
        initialize_mbr: Initializes the edges of the parcel's minimum bounding rectangle (MBR).
        calculate_and_set_mbr_bearings: Calculates the bearings of the MBR's edges and stores them.
        calculate_rhumb_bearing: Calculates the rhumb bearing between two points.
        set_edge_attribute: Sets an attribute for a specified edge.
        get_edge_attribute: Gets an attribute for a specified edge.
        get_all_parcel_edges: Retrieves all edges of the parcel with their attributes.
        get_all_mbr_edges: Retrieves all edges of the MBR with their attributes.
    """
    def __init__(self, polygons, parcel_id, owner_name=None, address=None, zoning=None, source_crs="EPSG:4326", **kwargs):
        """
        Initialize a new Parcel object with a unique ID and optional attributes.

        Parameters:
            polygons (Sequence): A sequence of tuples representing the polygon's coordinates.
            parcel_id (str): A unique identifier for the parcel.
            owner_name (str, optional): The name of the owner of the parcel. Defaults to None.
            address (str, optional): The address of the parcel. Defaults to None.
            zoning (str, optional): The zoning classification of the parcel. Defaults to None.
            source_crs (str): The coordinate reference system of the parcel's points. Defaults to "EPSG:4326".

        Raises:
            ValueError: If the provided polygon is not valid.
        """
        super().__init__(polygons, **kwargs)
        self.parcel_id = parcel_id
        self.owner_name = owner_name
        self.address = address
        self.zoning = zoning
        self.source_crs = source_crs
        self.edge_attributes = {}
        self.mbr_edge_attributes = {}
        self.initialize_edges()
        self.initialize_mbr()

    def initialize_edges(self):
        """
        Extracts the edges from the exterior ring of the parcel and initializes their attributes.
        Each edge is stored as a LineString object.

        Raises:
            ValueError: If the polygon is invalid or does not have an exterior.
        """
        # Extract edges from the exterior ring and store them as LineString objects
        if self.is_valid and self.exterior is not None:
            coords = list(self.exterior.coords)
            self.edges = [LineString([coords[i], coords[i+1]]) for i in range(len(coords) - 1)]
            self.calculate_and_set_bearings()
        else:
            raise ValueError("Invalid polygon.")

    def calculate_and_set_bearings(self):
        """
        Calculates the rhumb bearings of the parcel's edges and stores them in edge_attributes.
        """
        for i, edge in enumerate(self.edges):
            bearing = self.calculate_rhumb_bearing(edge.coords[0], edge.coords[1])
            self.set_edge_attribute(i, 'bearing', bearing)

    def initialize_mbr(self):
        """
        Calculates the minimum bounding rectangle (MBR) of the parcel and initializes the edges 
        along with their attributes.
        """
         # Calculate the minimum bounding rectangle of the parcel
        mbr = self.minimum_rotated_rectangle

        # Ensure the MBR is valid and has an exterior
        if mbr.is_valid and mbr.exterior is not None:
            mbr_coords = list(mbr.exterior.coords)
            # Create LineString objects for each edge of the MBR, excluding the closing point which is the same as the first
            self.mbr_edges = [LineString([mbr_coords[i], mbr_coords[i+1]]) for i in range(len(mbr_coords) - 1)]

            # Set the "side_name" attribute for each edge
            for i, edge in enumerate(self.mbr_edges):
                self.set_edge_attribute(i, "side_name", f"side_{i+1}", mbr=True)

            self.calculate_and_set_mbr_bearings()
        else:
            raise ValueError("Invalid minimum bounding rectangle.")

    def calculate_and_set_mbr_bearings(self):
        """
        Calculates the bearings of the minimum bounding rectangle (MBR) edges and stores them.
        """
        for i, edge in enumerate(self.mbr_edges):
            bearing = self.calculate_rhumb_bearing(edge.coords[0], edge.coords[1])
            self.set_edge_attribute(i, "bearing", bearing, mbr=True)

    def calculate_rhumb_bearing(self, pt1: Tuple[float, float], pt2: Tuple[float, float]) -> float:
        """
        Calculates the rhumb bearing from the first point to the second point.

        Parameters:
            pt1 (Tuple[float, float]): The starting point (longitude, latitude).
            pt2 (Tuple[float, float]): The ending point (longitude, latitude).

        Returns:
            float: The calculated rhumb bearing in degrees.
        """
        geod = Geod(ellps="WGS84")
        transformer = Transformer.from_crs(self.source_crs, "EPSG:4326")
        lon1, lat1 = transformer.transform(pt1[1], pt1[0])
        lon2, lat2 = transformer.transform(pt2[1], pt2[0])
        angle, _, _ = geod.inv(lon1, lat1, lon2, lat2)
        bearing = (angle + 180) % 360 - 180
        return bearing

    def set_edge_attribute(self, edge_index, attribute, value, mbr=False):
        """
        Sets an attribute for a specified edge of the parcel or its MBR.

        Parameters:
            edge_index (int): The index of the edge in the list of edges.
            attribute (str): The name of the attribute to set.
            value (Any): The value of the attribute.
            mbr (bool): A flag to indicate whether to set the attribute for the MBR edge. Defaults to False.

        Raises:
            IndexError: If the edge index is out of range.
        """
        target_dict = self.mbr_edge_attributes if mbr else self.edge_attributes
        target_edges = self.mbr_edges if mbr else self.edges
        if edge_index < len(target_edges):
            edge_wkt = target_edges[edge_index].wkt
            if edge_wkt not in target_dict:
                target_dict[edge_wkt] = {}
            target_dict[edge_wkt][attribute] = value
        else:
            raise IndexError("Edge index out of range.")
    
    def get_edge_attribute(self, edge_index, attribute, mbr=False):
        """
        Gets an attribute for a specified edge of the parcel or its MBR.

        Parameters:
            edge_index (int): The index of the edge in the list of edges.
            attribute (str): The name of the attribute to retrieve.
            mbr (bool): A flag to indicate whether to get the attribute for the MBR edge. Defaults to False.

        Returns:
            The value of the requested attribute, or None if the attribute does not exist.

        Raises:
            IndexError: If the edge index is out of range.
        """
        target_dict = self.mbr_edge_attributes if mbr else self.edge_attributes
        target_edges = self.mbr_edges if mbr else self.edges
        if edge_index < len(target_edges):
            return target_dict[target_edges[edge_index].wkt].get(attribute, None)
        else:
            raise IndexError("Edge index out of range.")
        
    def get_all_parcel_edges(self):
        """
        Retrieves all edges of the parcel with their respective WKT, coordinates, and attributes.

        Returns:
            List[dict]: A list of dictionaries for each edge containing WKT, coordinates, and attributes.
        """
        edges_info = []
        for edge in self.edges:
            edge_info = {
                'wkt': edge.wkt,
                'coordinates': list(edge.coords),
                'attributes': self.edge_attributes[edge.wkt]
            }
            edges_info.append(edge_info)
        return edges_info

    def get_all_mbr_edges(self):
        """
        Retrieves all edges of the minimum bounding rectangle (MBR) with their respective WKT,
        coordinates, and attributes.

        Returns:
            List[dict]: A list of dictionaries for each MBR edge containing WKT, coordinates, and attributes.
        """
        edges_info = []
        for edge in self.mbr_edges:
            edge_info = {
                'wkt': edge.wkt,
                'coordinates': list(edge.coords),
                'attributes': self.mbr_edge_attributes[edge.wkt]
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