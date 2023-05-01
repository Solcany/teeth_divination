import numpy as np

def get_dist(p1, p2) -> float:
    # euclidean 2d distance
    return ((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2) ** 0.5

def remap(value):
    # remap value from -1:1 range to 0:1 range
    return (value + 1) / 2

def normalise_pos(pos, center_pos, max_distance):
    # returns normalised x,y positions in 0:1 range
    x = pos[0] - center_pos[0]
    y = pos[1] - center_pos[1]
    return [remap(x/max_distance), remap(y/max_distance)]

def normalise_tooth_positions(teeth_pos):
    # normalises all positions of a tooth 
    # Assumes the first tooth position is the central tooth 
    center_pos = teeth_pos[0]
    rest_pos = teeth_pos[1:]

    # find the bounding distance against which to normalise
    # bounding distance is the most distant point measured from the center point
    distances = np.array([get_dist(center_pos, pos) for pos in rest_pos])
    idx = np.argmax(distances)
    max_dist = distances[idx]
    normalised_pos = np.array([normalise_pos(pos, center_pos, max_dist) for pos in teeth_pos])

    return normalised_pos




