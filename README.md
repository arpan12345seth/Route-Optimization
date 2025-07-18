# 🗺️ Intelligent-Route-Optimization-Using-TSP-Solver

## 🧠 Overview
This project delivers a smart, interactive web application that helps optimize travel or delivery routes using the **Travelling Salesman Problem (TSP)** approach. It’s perfect for **logistics**, **field service**, and **delivery-based businesses** where minimizing distance or time is crucial.

Designed with a **clean frontend and a powerful Python backend**, this tool computes the shortest possible route to visit a set of locations and return to the starting point—making it ideal for vehicle routing, courier path optimization, or even travel planning.

---

## 🚀 Features

- 🧠 **TSP-Based Route Solver**  
  Efficiently calculates the shortest route using a TSP algorithm implemented in Python with **NumPy**.

- 📍 **Interactive Web Interface**  
  A smooth and minimalistic **Flask** UI that lets users select locations and visualize optimized paths via map points.

- ⚙️ **Utility-Driven Backend**  
  Modular Python scripts handle tasks like distance matrix creation, route sequencing, and frontend-backend communication.

- 🌐 **Modern Web Stack**  
  Built with **HTML**, **CSS**, and **JavaScript** for the frontend and a Flask server to coordinate the logic.

- 🚀 **Fast and Lightweight**  
  Pure Python logic ensures this tool runs locally without heavy server load or complex dependencies.

---

## 🗺️ Google Maps Integration

This project uses the **Google Maps JavaScript API** for interactive location selection and visualization.

- 🔑 **You must obtain a Google Maps API Key** and enable the JavaScript Maps API in your Google Cloud Console.
- ⚠️ Add your **Google Maps API key** in the `app.py` file under the section marked:  
  `"API_KEY"` — update the placeholder with your actual API key.
---

## ⚙️ Installation

### 🧩 Prerequisites

Ensure you have the following installed:

- Python 3.8+
- pip (Python package installer)

### 📦 Required Libraries

- Flask  
- NumPy  
- Google Maps API Client (googlemaps)

You can install them using:

```bash
pip install flask numpy googlemaps
```

---

### 🛠️ Setup Instructions

1. **Clone the repository**:
    ```bash
    git clone https://github.com/arpan12345seth/Route-Optimization.git
    cd Route-Optimization
    ```

2. **Install the dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3. **Run the application**:
    ```bash
    python app.py
    ```

4. **Access the web platform**:  
   Open your browser and go to:  
   `http://127.0.0.1:5000`

---

## 🎯 Use Cases

- **Logistics companies** optimizing delivery paths.
- **Field engineers or service teams** covering multiple appointments.
- **Students or researchers** studying optimization algorithms.
- **Travelers or tourists** planning shortest sightseeing routes.

---

## 🧩 Future Enhancements

- Add map service integration (Google Maps, Leaflet, or Ola Maps).
- Implement real road distances (API-based instead of Euclidean).
- Support real-time traffic and dynamic re-routing.
- Enable user account login to save and retrieve past routes.
