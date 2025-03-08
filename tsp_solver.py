import numpy as np
from scipy.spatial.distance import pdist, squareform

def solve_tsp(coordinates):
    n = len(coordinates)
    distance_matrix = squareform(pdist(coordinates))
    visited = [0]  # Start from the warehouse
    unvisited = list(range(1, n))

    while unvisited:
        last = visited[-1]
        next_city = min(unvisited, key=lambda x: distance_matrix[last][x])
        visited.append(next_city)
        unvisited.remove(next_city)
    
    # Return to the starting point (warehouse)
    visited.append(0)

    return visited
