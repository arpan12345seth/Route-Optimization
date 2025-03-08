let map;
let directionsService;
let directionsRenderer;
let warehouseMarker;
let selectedVehicle = null;

// Initialize Google Map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 28.6139, lng: 77.2090 }, // Default to New Delhi
        zoom: 6,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map });
}

window.initMap = initMap;

// Vehicles and Delivery Locations
const vehicles = {
    bike: [],
    truck: [],
    van: []
};

const deliveryLocations = [];
let warehouseDetails = null;

// Add Warehouse Marker
function addWarehouseMarker(coords) {
    if (warehouseMarker) {
        warehouseMarker.setMap(null); // Remove existing marker
    }
    warehouseMarker = new google.maps.Marker({
        position: coords,
        map: map,
        title: 'Warehouse Location',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    });

    map.setCenter(coords);
    map.setZoom(10);
}

// Warehouse Submission
document.getElementById('submit-warehouse-btn').addEventListener('click', function () {
    const warehouseAddress = document.getElementById('warehouse-address').value;
    const state = document.getElementById('warehouse-state').value;

    if (warehouseAddress && state) {
        warehouseDetails = { warehouseAddress, state };
        alert(`Warehouse details saved: ${warehouseAddress}, ${state}`);
    } else {
        alert('Please fill out both the warehouse address and state!');
    }
});

// Add Vehicle Details
document.getElementById('add-vehicle-btn').addEventListener('click', function () {
    const vehicleName = document.getElementById('vehicle-name').value;
    const vehicleType = document.getElementById('vehicle-type').value;
    const carryingCapacity = parseFloat(document.getElementById('carrying-capacity').value);
    const fuelEfficiency = parseFloat(document.getElementById('fuel-efficiency').value);

    if (vehicleName && vehicleType && carryingCapacity && fuelEfficiency) {
        if (vehicles[vehicleType].some(v => v.name === vehicleName)) {
            alert('Vehicle name must be unique!');
            return;
        }

        vehicles[vehicleType].push({
            name: vehicleName,
            carryingCapacity,
            fuelEfficiency,
            currentCapacity: 0 // Initialize current capacity
        });
        alert(`${vehicleName} added to ${vehicleType}!`);
        document.getElementById('vehicle-name').value = '';
        document.getElementById('carrying-capacity').value = '';
        document.getElementById('fuel-efficiency').value = '';
        updateVehicleSelection();
        updateVehicleDropdownForRoute();
    } else {
        alert('Please fill all vehicle details!');
    }
});

// Update vehicle dropdown in Delivery Location section
function updateVehicleSelection() {
    const vehicleSelect = document.getElementById('vehicle-selection');
    vehicleSelect.innerHTML = ''; // Clear existing options

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select Vehicle';
    vehicleSelect.appendChild(placeholderOption);

    for (const vehicleType in vehicles) {
        vehicles[vehicleType].forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.name;
            option.textContent = `${vehicle.name} (${vehicleType})`;
            vehicleSelect.appendChild(option);
        });
    }
}

// Handle Vehicle Selection in "Add Delivery Location" Section
document.getElementById('vehicle-selection').addEventListener('change', function () {
    const selectedVehicleName = this.value;

    if (selectedVehicleName) {
        for (const vehicleType in vehicles) {
            const foundVehicle = vehicles[vehicleType].find(v => v.name === selectedVehicleName);
            if (foundVehicle) {
                selectedVehicle = {
                    type: vehicleType,
                    name: foundVehicle.name,
                };
                break;
            }
        }
    } else {
        selectedVehicle = null;
    }
});

// Add Delivery Location
document.getElementById('add-location-btn').addEventListener('click', function () {
    const address = document.getElementById('address').value;
    const pincode = document.getElementById('pincode').value;
    const region = document.getElementById('region').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const priority = document.getElementById('priority').value;

    if (!selectedVehicle) {
        alert('Please select a vehicle first!');
        return;
    }

    const currentVehicle = vehicles[selectedVehicle.type].find(v => v.name === selectedVehicle.name);

    if (!currentVehicle) {
        alert('Selected vehicle not found!');
        return;
    }

    if (currentVehicle.currentCapacity + weight > currentVehicle.carryingCapacity) {
        alert(`Capacity exceeded for ${currentVehicle.name}. Please select a different vehicle.`);
        return;
    }

    if (address && pincode && region && weight && priority) {
        deliveryLocations.push({
            address,
            pincode,
            region,
            weight,
            priority,
            vehicle: selectedVehicle.name
        });

        currentVehicle.currentCapacity += weight;
        alert(`Delivery location added to ${currentVehicle.name}!`);
        document.getElementById('address').value = '';
        document.getElementById('pincode').value = '';
        document.getElementById('region').value = '';
        document.getElementById('weight').value = '';
        document.getElementById('priority').value = 'A';
        updateMapDisplay();
    } else {
        alert('Please fill all delivery location details!');
    }
});

// Update Vehicle Dropdown for "View Delivery Route" Section
function updateVehicleDropdownForRoute() {
    const vehicleTypeSelect = document.getElementById('select-vehicle-type');
    const vehicleNameSelect = document.getElementById('select-vehicle-name');

    vehicleTypeSelect.innerHTML = '<option value="">Select Vehicle Type</option>';
    vehicleNameSelect.innerHTML = '<option value="">Select Vehicle Name</option>';

    for (const vehicleType in vehicles) {
        if (vehicles[vehicleType].length > 0) {
            const option = document.createElement('option');
            option.value = vehicleType;
            option.textContent = vehicleType;
            vehicleTypeSelect.appendChild(option);
        }
    }

    vehicleTypeSelect.addEventListener('change', function () {
        const selectedType = this.value;
        vehicleNameSelect.innerHTML = '<option value="">Select Vehicle Name</option>';

        if (selectedType && vehicles[selectedType]) {
            vehicles[selectedType].forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.name;
                option.textContent = vehicle.name;
                vehicleNameSelect.appendChild(option);
            });
        }
    });
}

// Handle View Route Button Click
document.getElementById('view-route-btn').addEventListener('click', function () {
    const vehicleType = document.getElementById('select-vehicle-type').value;
    const vehicleName = document.getElementById('select-vehicle-name').value;

    if (!vehicleType || !vehicleName) {
        alert('Please select both a vehicle type and name!');
        return;
    }

    if (!warehouseDetails) {
        alert('Please provide the warehouse details!');
        return;
    }

    const selectedDeliveries = deliveryLocations.filter(loc => loc.vehicle === vehicleName);

    if (selectedDeliveries.length === 0) {
        alert(`No deliveries assigned to ${vehicleName}`);
        return;
    }

    // Fetch optimization route data
    fetch('/optimize-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            warehouse: warehouseDetails,
            deliveryLocations: selectedDeliveries,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                console.log(data.optimized_routes);

                // Check if the optimized route exists for the selected vehicle
                if (!data.optimized_routes || !data.optimized_routes[vehicleName]) {
                    alert('No optimized route available!');
                } else {
                    const routeData = data.optimized_routes[vehicleName];
                    renderRoute(routeData.route); // Call renderRoute to display on the map
                    alert(`Route optimized! Total Distance: ${routeData.distance.toFixed(2)} km`);
                }
            }
        })
        .catch((error) => {
            console.error('Fetch Error Details:', error);
            alert(`Fetch Error: ${error.message}`);
        });
});

// Render Optimized Route on the Map
function renderRoute(routeCoordinates) {
    if (routeCoordinates.length > 1) {
        const waypoints = routeCoordinates.slice(1, -1).map(coord => ({
            location: { lat: coord[0], lng: coord[1] },
            stopover: true
        }));

        const request = {
            origin: { lat: routeCoordinates[0][0], lng: routeCoordinates[0][1] },
            destination: {
                lat: routeCoordinates[routeCoordinates.length - 1][0],
                lng: routeCoordinates[routeCoordinates.length - 1][1]
            },
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING,
        };

        directionsService.route(request, function (result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
            } else {
                alert('Failed to render route on map!');
            }
        });
    } else {
        alert('Not enough points for a route!');
    }
}

// Update Map Display with Markers
function updateMapDisplay() {
    deliveryLocations.forEach(location => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: `${location.address}, ${location.region}, ${location.pincode}` }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                new google.maps.Marker({
                    position: results[0].geometry.location,
                    map: map,
                    title: location.address,
                });
            }
        });
    });
}
