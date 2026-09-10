"""
Partner Routing Engine service using Haversine Distance algorithm.
"""

import math
from app.models.partner import ChannelPartner

CITY_COORDINATE_MAP = {
    "thiruvananthapuram": (8.5241, 76.9366),
    "trivandrum": (8.5241, 76.9366),
    "kerala": (8.5241, 76.9366),
    "kochi": (9.9312, 76.2673),
    "ernakulam": (9.9312, 76.2673),
    "kozhikode": (11.2588, 75.7804),
    "calicut": (11.2588, 75.7804),
    "delhi": (28.6139, 77.2090),
    "new delhi": (28.6139, 77.2090),
    "noida": (28.5355, 77.3910),
    "mumbai": (19.0760, 72.8777),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "chennai": (13.0827, 80.2707),
    "hyderabad": (17.3850, 78.4867),
}


def resolve_location_coordinates(location: dict | str | None) -> tuple[float, float]:
    """
    Resolves a location dict or string into (latitude, longitude) coordinates.
    Matches major cities/states in India or defaults to Thiruvananthapuram (8.5241, 76.9366).
    """
    if not location:
        return (8.5241, 76.9366)

    loc_str = ""
    if isinstance(location, dict):
        loc_str = " ".join(str(v) for v in location.values() if v).lower()
    elif isinstance(location, str):
        loc_str = location.lower()

    for city_key, coords in CITY_COORDINATE_MAP.items():
        if city_key in loc_str:
            return coords

    # Default fallback to Thiruvananthapuram
    return (8.5241, 76.9366)


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two geographical points on Earth
    (given in decimal degrees) using the Haversine formula.

    Parameters
    ----------
    lat1, lon1 : float
        Latitude and longitude of point 1.
    lat2, lon2 : float
        Latitude and longitude of point 2.

    Returns
    -------
    float
        Straight-line ground distance in kilometers rounded to 2 decimal places.
    """
    R = 6371.0  # Mean radius of Earth in kilometers

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = R * c
    return round(distance, 2)


async def find_nearest_partners(
    scheme_id: str, user_lat: float, user_lon: float, limit: int = 3
) -> list[dict]:
    """
    Query channel partners compatible with `scheme_id`, calculate their Haversine distance
    from `(user_lat, user_lon)`, sort by ascending distance, and return the top `limit` partners.
    """
    partners = await ChannelPartner.find({"compatible_schemes": scheme_id}).to_list()

    ranked = []
    for partner in partners:
        dist = haversine_distance(user_lat, user_lon, partner.latitude, partner.longitude)
        p_dict = partner.model_dump(mode="json", exclude={"id"})
        p_dict["distance_km"] = dist
        ranked.append(p_dict)

    # Sort in ascending order of ground distance
    ranked.sort(key=lambda item: item["distance_km"])

    return ranked[:limit]
