# app.py
from flask import Flask, render_template, request, jsonify
from gridWorld import GridWorld
from qAgent import Q_Agent
from game import play, find_best_path


app = Flask(__name__)


@app.route('/')
def index():
    # Default grid size
    grid_size = 5
    grid_data = generate_grid_data(grid_size)
    obstacles = [(1,1), (2,1), (2,2)]
    env = GridWorld(size=grid_size, start=(0,0), end=(grid_size-1, grid_size-1), obstacles=obstacles)
    q_agent = Q_Agent(env)
    reward_per_episode, all_training_path = play(env, q_agent, trials=500)
    best_path = find_best_path(q_agent, env)

    return render_template('index.html', grid_size=grid_size, grid_data=grid_data, best_path=best_path, all_training_path = all_training_path, obstacles=obstacles)

@app.route('/generate-grid', methods=['POST'])
def generate_grid():
    data = request.json
    
    # Get grid size from request
    grid_size = data.get('size', 5)
    
    # Get start and end points
    start_point = tuple(data.get('start', [0, 0]))
    end_point = tuple(data.get('end', [grid_size-1, grid_size-1]))
    
    # Get custom obstacles
    custom_obstacles = data.get('obstacles', [])
    obstacles = [tuple(obs) for obs in custom_obstacles]
    
    # Validate grid size
    try:
        grid_size = int(grid_size)
        if grid_size < 3:
            grid_size = 3
        elif grid_size > 10:
            grid_size = 10
    except ValueError:
        grid_size = 5
    
    # Generate grid data
    grid_data = generate_grid_data(grid_size)
    
    # Validate obstacles (ensure they're within grid bounds)
    valid_obstacles = []
    for obs in obstacles:
        if 0 <= obs[0] < grid_size and 0 <= obs[1] < grid_size:
            # Ensure obstacles don't overlap with start or end
            if obs != start_point and obs != end_point:
                valid_obstacles.append(obs)
    
    # Create environment with custom start/end points and obstacles
    env = GridWorld(size=grid_size, start=start_point, end=end_point, obstacles=valid_obstacles)
    
    # Check if a valid path exists using BFS before running Q-learning
    path_exists = check_valid_path_exists(grid_size, start_point, end_point, valid_obstacles)
    
    if not path_exists:
        # No valid path exists - return early with just the start point
        return jsonify({
            'grid_size': grid_size,
            'grid_data': grid_data,
            'best_path': [list(start_point)],
            'training_path': [list(start_point)],
            'obstacles': valid_obstacles,
            'path_exists': False
        })
    
    # Valid path exists, proceed with Q-learning
    try:
        q_agent = Q_Agent(env)
        reward_per_episode, all_training_path = play(env, q_agent, trials=500)
        best_path = find_best_path(q_agent, env)
        
        # Additional validation to ensure the path doesn't go through obstacles
        # Even with a valid path existing, Q-learning might still generate invalid paths sometimes
        filtered_best_path = validate_and_filter_path(best_path, valid_obstacles)
        filtered_training_path = validate_and_filter_training_path(all_training_path, valid_obstacles)
        
        # If filtering removed all points, fallback to just the start point
        if not filtered_best_path or len(filtered_best_path) <= 1:
            filtered_best_path = [list(start_point)]
            
        # Convert training path to list of lists
        training_path_list = [list(pos) for pos in filtered_training_path]
        
    except Exception as e:
        print(f"Error in Q-learning path finding: {e}")
        filtered_best_path = [list(start_point)]
        training_path_list = [list(start_point)]

    return jsonify({
        'grid_size': grid_size,
        'grid_data': grid_data,
        'best_path': filtered_best_path,
        'training_path': training_path_list,
        'obstacles': valid_obstacles,
        'path_exists': True
    })

def check_valid_path_exists(grid_size, start, end, obstacles):
    """
    Check if at least one valid path exists from start to end
    using Breadth-First Search (BFS)
    """
    # Convert obstacles to set for O(1) lookup
    obstacle_set = set(obstacles)
    
    # Define possible movements (up, right, down, left)
    movements = [(-1, 0), (0, 1), (1, 0), (0, -1)]
    
    # BFS Queue
    from collections import deque
    queue = deque([start])
    visited = set([start])
    
    while queue:
        current = queue.popleft()
        
        # If reached the end, a path exists
        if current == end:
            return True
            
        # Try all possible movements
        for movement in movements:
            next_pos = (current[0] + movement[0], current[1] + movement[1])
            
            # Check if next position is valid
            if (0 <= next_pos[0] < grid_size and 
                0 <= next_pos[1] < grid_size and 
                next_pos not in obstacle_set and
                next_pos not in visited):
                visited.add(next_pos)
                queue.append(next_pos)
    
    # If we've exhausted all possibilities without finding the end
    return False

def validate_and_filter_path(path, obstacles):
    """
    Validate the best path to ensure it doesn't go through obstacles
    and doesn't contain impossible jumps
    """
    if not path:
        return []
        
    obstacle_set = set(obstacles)
    filtered_path = []
    
    for i, pos in enumerate(path):
        # Convert to tuple for comparison
        pos_tuple = tuple(pos)
        
        # Skip obstacles
        if pos_tuple in obstacle_set:
            continue
            
        # Check for impossible jumps (non-adjacent cells)
        if filtered_path:
            prev_pos = filtered_path[-1]
            dx = abs(prev_pos[0] - pos[0])
            dy = abs(prev_pos[1] - pos[1])
            
            # If not adjacent (Manhattan distance > 1), skip
            if dx + dy > 1:
                continue
                
        filtered_path.append(pos)
    
    return filtered_path

def validate_and_filter_training_path(training_path, obstacles):
    """
    Filter out invalid positions from training path
    """
    obstacle_set = set(obstacles)
    return [pos for pos in training_path if tuple(pos) not in obstacle_set]

def generate_grid_data(size):
    """Generate a 2D grid array with row,col coordinates"""
    grid = []
    for row in range(size):
        grid_row = []
        for col in range(size):
            grid_row.append({
                'row': row,
                'col': col,
                'text': f"{row},{col}"
            })
        grid.append(grid_row)
    return grid

if __name__ == '__main__':
    app.run(debug=True)