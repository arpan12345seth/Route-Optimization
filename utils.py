import googlemaps
from geopy.distance import geodesic

def get_geocoordinates(gmaps, address):
    try:
        result = gmaps.geocode(address)
        if result:
            location = result[0]['geometry']['location']
            return location['lat'], location['lng']
        else:
            raise ValueError(f"No geocoordinates found for address: {address}")
    except Exception as e:
        raise ValueError(f"Error fetching geocoordinates: {e}")

def calculate_route_distance(route):
    distance = 0
    for i in range(len(route) - 1):
        distance += geodesic(route[i], route[i + 1]).km
    return distance
