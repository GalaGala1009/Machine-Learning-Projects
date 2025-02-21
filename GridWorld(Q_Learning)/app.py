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
    env = GridWorld(size=grid_size, start=(0,0), end = (grid_size-1, grid_size-1),obstacles=obstacles)
    q_agent = Q_Agent(env)
    reward_per_episode, all_training_process = play(env, q_agent, trials=500)
    best_path = find_best_path(q_agent, env)


    return render_template('index.html', grid_size=grid_size, grid_data=grid_data, best_path=all_training_process, obstacles=obstacles)

@app.route('/generate-grid', methods=['POST'])
def generate_grid():
    # Get grid size from request
    grid_size = request.json.get('size', 5)
    
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
    obstacles = [(1,1), (2,1), (2,2)]
    env = GridWorld(size=grid_size, start=(0,0), end = (int(grid_size)-1, int(grid_size)-1),obstacles=obstacles)
    q_agent = Q_Agent(env)
    reward_per_episode, all_training_process = play(env, q_agent, trials=500)
    best_path = find_best_path(q_agent, env)


    return jsonify({
        'grid_size': grid_size,
        'grid_data': grid_data,
        'best_path': all_training_process,
        'obstacles': obstacles
    })

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