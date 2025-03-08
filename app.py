from flask import Flask, request, jsonify, render_template
from tsp_solver import solve_tsp
from utils import get_geocoordinates, calculate_route_distance
import googlemaps
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'

# Initialize Google Maps API client
GMAPS_API_KEY = 'API_KEY'
gmaps = googlemaps.Client(key=GMAPS_API_KEY)

# Data storage
warehouse_details = None
vehicles = {
    "bike": [],
    "truck": [],
    "van": []
}
delivery_locations = []

# Home route
@app.route('/')
def home():
    return render_template('index.html')

# Optimize route endpoint
@app.route('/optimize-route', methods=['POST'])
def optimize_route():
    global warehouse_details, delivery_locations

    # Parse the incoming request
    data = request.json
    warehouse = data.get('warehouse')
    locations = data.get('deliveryLocations')

    if not warehouse or not locations:
        return jsonify({"error": "Warehouse details or delivery locations missing!"}), 400

    # Get warehouse coordinates
    try:
        warehouse_coords = get_geocoordinates(gmaps, warehouse['warehouseAddress'])
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # Get coordinates for delivery locations
    coordinates = [warehouse_coords]
    for loc in locations:
        try:
            loc_coords = get_geocoordinates(gmaps, loc['address'])
            coordinates.append(loc_coords)
        except ValueError as e:
            return jsonify({"error": f"Error with address {loc['address']}: {e}"}), 400

    # Solve the TSP
    tsp_route = solve_tsp(coordinates)

    # Create the optimized route
    optimized_route = [coordinates[i] for i in tsp_route]
    distance = calculate_route_distance(optimized_route)

    response = {
        "optimized_routes": {
            locations[0]['vehicle']: {
                "route": optimized_route,
                "distance": distance
            }
        }
    }
    return jsonify(response)

# Add vehicle route
@app.route('/add-vehicle', methods=['POST'])
def add_vehicle():
    data = request.json
    vehicle_name = data.get('name')
    vehicle_type = data.get('type')
    carrying_capacity = data.get('carryingCapacity')
    fuel_efficiency = data.get('fuelEfficiency')

    if not all([vehicle_name, vehicle_type, carrying_capacity, fuel_efficiency]):
        return jsonify({"error": "All vehicle details are required!"}), 400

    if any(v['name'] == vehicle_name for v in vehicles[vehicle_type]):
        return jsonify({"error": "Vehicle name must be unique!"}), 400

    vehicles[vehicle_type].append({
        "name": vehicle_name,
        "carryingCapacity": carrying_capacity,
        "fuelEfficiency": fuel_efficiency,
        "currentCapacity": 0
    })
    return jsonify({"message": f"Vehicle {vehicle_name} added successfully!"})

# Add delivery location route
@app.route('/add-delivery-location', methods=['POST'])
def add_delivery_location():
    data = request.json
    vehicle_name = data.get('vehicle')
    address = data.get('address')
    weight = data.get('weight')

    if not all([vehicle_name, address, weight]):
        return jsonify({"error": "Vehicle, address, and weight are required!"}), 400

    selected_vehicle = None
    for vehicle_type in vehicles:
        for vehicle in vehicles[vehicle_type]:
            if vehicle['name'] == vehicle_name:
                selected_vehicle = vehicle
                break

    if not selected_vehicle:
        return jsonify({"error": "Selected vehicle not found!"}), 400

    if selected_vehicle['currentCapacity'] + weight > selected_vehicle['carryingCapacity']:
        return jsonify({"error": "No space in the vehicle, please choose another vehicle!"}), 400

    delivery_locations.append({
        "vehicle": vehicle_name,
        "address": address,
        "weight": weight
    })

    selected_vehicle['currentCapacity'] += weight
    return jsonify({"message": f"Delivery location added for vehicle {vehicle_name}!"})

if __name__ == '__main__':
    app.run(debug=True)
