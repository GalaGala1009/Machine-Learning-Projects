// static/js/main.js
// Global variables
let gridSize = initialGridSize;
let gridData = initialGridData;
let best_path = initialBestPath;
let training_path = initialTrainingPath;
let obstacles = initialObstacles;
let path_len = best_path.length;
let cur_path = 0;
let animationInterval;
let trainingInterval;
let startRow = 0;
let startCol = 0;
let endRow = gridSize - 1;
let endCol = gridSize - 1;
let currentRow = best_path.length > 0 ? best_path[cur_path][0] : 0;
let currentCol = best_path.length > 0 ? best_path[cur_path][1] : 0;
let currentTrainingIdx = 0;
let isAnimating = false;
let isTrainingAnimating = false;
let selectionMode = null; // Can be 'start', 'end', 'obstacle', or null
let previousGridSize = gridSize; // record previous grid size
let animationSpeed = 100; // Default animation speed

/**
 * Renders the grid based on current gridData
 */
function renderGrid() {
    const gridContainer = document.getElementById('grid-container');
    
    // Clear existing grid
    gridContainer.innerHTML = '';
    
    // Set the grid template
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    // Create cells from server data
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellData = gridData[row][col];
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${row}-${col}`;
            cell.textContent = cellData.text;
            
            // Add click event listener for cell selection
            cell.addEventListener('click', () => handleCellClick(row, col));
            
            gridContainer.appendChild(cell);
        }
    }
    
    // Highlight cells
    highlightStartCell();
    highlightEndCell();
    highlightObstacleCells();
    if (best_path.length > 0) {
        highlightCurrentCell();
    }
    
    // Update obstacle count display
    updateObstacleCount();
}

/**
 * Updates the obstacle count display
 */
function updateObstacleCount() {
    const obstacleCountElement = document.getElementById('obstacle-count');
    if (obstacleCountElement) {
        obstacleCountElement.textContent = obstacles.length;
    }
}

/**
 * Handles cell click for start/end/obstacle selection
 */
function handleCellClick(row, col) {
    // Don't allow clicks during animation
    if (isAnimating || isTrainingAnimating) return;
    
    // Check if the cell is the start or end point
    const isStart = (row === startRow && col === startCol);
    const isEnd = (row === endRow && col === endCol);
    
    if (selectionMode === 'start') {
        // Don't allow setting start on end or obstacle
        if (isEnd) {
            alert("Cannot select the end point as the start point!");
            return;
        }
        
        // Check if selecting an obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i][0] === row && obstacles[i][1] === col) {
                // Remove the obstacle if selecting it as start
                obstacles.splice(i, 1);
                break;
            }
        }
        
        // Set new start position
        startRow = row;
        startCol = col;
        
        // Update display
        highlightStartCell();
        highlightObstacleCells();
        updateObstacleCount();
        
        // Reset selection mode
        selectionMode = null;
        document.getElementById('select-start-btn').classList.remove('active');
        
        // upate best path after setting start point
        fetchNewGrid();
    }
    else if (selectionMode === 'end') {
        // Don't allow setting end on start or obstacle
        if (isStart) {
            alert("Cannot select the start point as the end point!");
            return;
        }
        
        // Check if selecting an obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i][0] === row && obstacles[i][1] === col) {
                // Remove the obstacle if selecting it as end
                obstacles.splice(i, 1);
                break;
            }
        }
        
        // Set new end position
        endRow = row;
        endCol = col;
        
        // Update display
        highlightEndCell();
        highlightObstacleCells();
        updateObstacleCount();
        
        // Reset selection mode
        selectionMode = null;
        document.getElementById('select-end-btn').classList.remove('active');
        
        // update best path after setting end point
        fetchNewGrid();
    }
    else if (selectionMode === 'obstacle') {
        // Don't allow setting obstacle on start or end
        if (isStart) {
            alert("Cannot place an obstacle on the start point!");
            return;
        }
        if (isEnd) {
            alert("Cannot place an obstacle on the end point!");
            return;
        }
        
        // Check if the cell is already an obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i][0] === row && obstacles[i][1] === col) {
                // If it is, remove it (toggle behavior)
                obstacles.splice(i, 1);
                highlightObstacleCells();
                updateObstacleCount();
                
                // update best path after removing obstacle
                fetchNewGrid();
                return;
            }
        }
        
        // Add new obstacle
        obstacles.push([row, col]);
        
        // Update display
        highlightObstacleCells();
        updateObstacleCount();
        
        // update best path after adding obstacle
        fetchNewGrid();
    }
}

/**
 * Clears all obstacles from the grid
 */
function clearObstacles() {
    obstacles = [];
    highlightObstacleCells();
    updateObstacleCount();
    
    // clear obstacles and update grid
    fetchNewGrid();
}

/**
 * Fetches new grid data from the server
 */
/**
 * Fetches new grid data from the server
 */
function fetchNewGrid() {
    // Stop any active animations
    if (isAnimating) {
        stopAnimation();
    }
    if (isTrainingAnimating) {
        stopTrainingAnimation();
    }
    
    // Get the grid size from input
    const requestedSize = parseInt(document.getElementById('grid-size').value);
    
    // check if grid size changed
    const sizeChanged = (requestedSize !== previousGridSize);
    
    // clear obstacles if grid size changed
    if (sizeChanged) {
        obstacles = [];
        updateObstacleCount();
        previousGridSize = requestedSize;
    }
    
    // Show loading indicator
    showLoadingIndicator();
    
    // Fetch new grid data from server
    fetch('/generate-grid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            size: requestedSize,
            start: [startRow, startCol],
            end: [endRow, endCol],
            obstacles: obstacles
        })
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading indicator
        hideLoadingIndicator();
        
        // Update with server data
        gridSize = data.grid_size;
        gridData = data.grid_data;
        best_path = data.best_path;
        training_path = data.training_path || []; // get training path if available
        
        // Update server data with valid obstacle positions
        obstacles = data.obstacles;
        
        // Check if path exists (server explicitly tells us)
        const pathExists = data.path_exists !== undefined ? data.path_exists : (best_path.length > 1);

        // Update input to reflect actual size used (in case it was adjusted)
        document.getElementById('grid-size').value = gridSize;

        // Reset animation state
        path_len = best_path.length;
        cur_path = 0;
        currentTrainingIdx = 0;
        
        if (best_path.length > 0) {
            currentRow = best_path[cur_path][0];
            currentCol = best_path[cur_path][1];
        }
        
        // Handle no path scenario
        handlePathExistence(pathExists);
        
        // Render the new grid
        renderGrid();
        
        // Update training button state and animation button states
        updateTrainingButtonState();
        updateAnimationButtonState(pathExists);
    })
    .catch(error => {
        hideLoadingIndicator();
        console.error('Error fetching grid data:', error);
        showErrorMessage('Failed to generate grid. Please try again.');
    });
}

/**
 * Shows or hides path existence message
 */
function handlePathExistence(pathExists) {
    // Remove existing message if any
    const existingMessage = document.getElementById('no-path-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // If no path exists, show message
    if (!pathExists) {
        const gridContainer = document.getElementById('grid-container');
        const message = document.createElement('div');
        message.id = 'no-path-message';
        message.className = 'no-path-alert';
        message.innerHTML = 'No valid path exists! Obstacles are blocking all possible paths from start to end.';
        gridContainer.parentNode.insertBefore(message, gridContainer.nextSibling);
    }
}

/**
 * Shows loading indicator
 */

function showLoadingIndicator() {
    /*
    const existingLoader = document.getElementById('grid-loader');
    if (!existingLoader) {
        const gridContainer = document.getElementById('grid-container');
        const loader = document.createElement('div');
        loader.id = 'grid-loader';
        loader.className = 'loader';
        loader.innerHTML = 'Calculating optimal path...';
        gridContainer.parentNode.insertBefore(loader, gridContainer);
    }*/
}

/**
 * Hides loading indicator
 */
function hideLoadingIndicator() {
    const loader = document.getElementById('grid-loader');
    if (loader) {
        loader.remove();
    }
}

/**
 * Shows error message
 */
function showErrorMessage(message) {
    const errorBox = document.createElement('div');
    errorBox.className = 'error-message';
    errorBox.textContent = message;
    
    // Add to document
    const gridContainer = document.getElementById('grid-container');
    gridContainer.parentNode.insertBefore(errorBox, gridContainer);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorBox.remove();
    }, 5000);
}

/**
 * Updates animation button state based on path existence
 * */
function updateAnimationButtonState(pathExists) {
    const animateBtn = document.getElementById('animate-btn');
    const trainingBtn = document.getElementById('training-animate-btn');
    
    if (!pathExists || best_path.length <= 1) {
        animateBtn.disabled = true;
        animateBtn.title = "No valid path to animate";
    } else {
        animateBtn.disabled = false;
        animateBtn.title = "";
    }
}

/**
 * updates the training button state based on training path availability
 */
function updateTrainingButtonState() {
    const trainingButton = document.getElementById('training-animate-btn');
    if (training_path && training_path.length > 0) {
        trainingButton.disabled = false;
        trainingButton.title = `Training Data: ${training_path.length} steps`;
    } else {
        trainingButton.disabled = true;
        trainingButton.title = "No training data available";
    }
}

/**
 * Highlights the start cell
 */
function highlightStartCell() {
    // Remove start class from all cells
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('start');
    });
    
    // Add start class to the start cell
    const startCell = document.getElementById(`cell-${startRow}-${startCol}`);
    if (startCell) {
        startCell.classList.add('start');
    }
}

/**
 * Highlights the end cell
 */
function highlightEndCell() {
    // Remove end class from all cells
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('end');
    });
    
    // Add end class to the end cell
    const endCell = document.getElementById(`cell-${endRow}-${endCol}`);
    if (endCell) {
        endCell.classList.add('end');
    }
}

/**
 * Highlights obstacle cells
 */
function highlightObstacleCells() {
    // Clear existing obstacle highlights
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('obstacle');
    });
    
    // Highlight all obstacles
    for (const obstacle of obstacles) {
        const obstacleCell = document.getElementById(`cell-${obstacle[0]}-${obstacle[1]}`);
        if (obstacleCell) {
            obstacleCell.classList.add('obstacle');
        }
    }
}

/**
 * Highlights the current cell in the animation
 */
function highlightCurrentCell() {
    // Remove highlight from all path cells
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('current');
    });
    
    // Add highlight to current cell if within bounds
    if (cur_path < best_path.length) {
        const currentCell = document.getElementById(`cell-${currentRow}-${currentCol}`);
        if (currentCell) {
            currentCell.classList.add('current');
        }
    }
}

/**
 * Highlights the current training cell
 */
function highlightTrainingCell(row, col) {
    // Remove training highlight from all cells
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('training');
    });
    
    // Add training highlight to the specified cell
    const trainingCell = document.getElementById(`cell-${row}-${col}`);
    if (trainingCell) {
        trainingCell.classList.add('training');
    }
}

/**
 * Moves to the next cell in the animation sequence
 * @returns {boolean} Whether the animation can continue
 */
function moveNext() {
    // Check if we've reached the end
    if (cur_path >= path_len - 1) {
        stopAnimation();
        return false;
    }

    // Move to the next position in the path
    cur_path++;
    currentRow = best_path[cur_path][0];
    currentCol = best_path[cur_path][1];
    
    // Highlight the new current cell
    highlightCurrentCell();
    return true;
}

/**
 * Starts the animation
 */
function startAnimation() {
    if (isAnimating || best_path.length <= 1) return;
    
    // Stop training animation if it's active
    if (isTrainingAnimating) {
        stopTrainingAnimation();
    }
    
    // Reset if we're at the end
    if (cur_path >= path_len - 1) {
        cur_path = 0;
        currentRow = best_path[cur_path][0];
        currentCol = best_path[cur_path][1];
        highlightCurrentCell();
    }
   
    isAnimating = true;
    document.getElementById('animate-btn').textContent = 'Stop Animation';
    
    // Get current animation speed
    const speedValue = 500 - document.getElementById('speed-slider').value;
    
    // Start the animation interval
    animationInterval = setInterval(() => {
        const canContinue = moveNext();
        if (!canContinue) {
            stopAnimation();
        }
    }, speedValue); // Animation speed
}

/**
 * Stops the animation
 */
function stopAnimation() {
    clearInterval(animationInterval); // Stop the animation interval
    isAnimating = false;
    document.getElementById('animate-btn').textContent = 'Start Animation';
}

/**
 * Toggles the animation state
 */
function toggleAnimation() {
    if (isAnimating) {
        stopAnimation();
    } else {
        startAnimation();
    }
}

/**
 * starts the training animation
 */
function startTrainingAnimation() {
    if (isTrainingAnimating || training_path.length <= 1) return;
    
    // Stop regular animation if it's active
    if (isAnimating) {
        stopAnimation();
    }
    
    // Reset if we're at the end
    if (currentTrainingIdx >= training_path.length - 1) {
        currentTrainingIdx = 0;
    }
    
    isTrainingAnimating = true;
    document.getElementById('training-animate-btn').textContent = 'Stop Training';
    
    // Get current animation speed
    const speedValue = 500 - document.getElementById('speed-slider').value;
    // make sure training speed is at least 10ms
    const trainingSpeedValue = Math.max(10, Math.floor(speedValue / 2));
    
    // Start the training animation interval
    trainingInterval = setInterval(() => {
        // Move to the next training position
        currentTrainingIdx++;
        
        // Check if we've reached the end
        if (currentTrainingIdx >= training_path.length) {
            stopTrainingAnimation();
            return;
        }
        
        const currentPos = training_path[currentTrainingIdx];
        highlightTrainingCell(currentPos[0], currentPos[1]);
        
    }, trainingSpeedValue);
}

/**
 * Stops the training animation
 */
function stopTrainingAnimation() {
    clearInterval(trainingInterval);
    isTrainingAnimating = false;
    document.getElementById('training-animate-btn').textContent = 'Show Training';
    
    // Clear training highlights
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('training');
    });
}

/**
 * Toggles the training animation state
 */
function toggleTrainingAnimation() {
    if (isTrainingAnimating) {
        stopTrainingAnimation();
    } else {
        startTrainingAnimation();
    }
}

/**
 * Activates start point selection mode
 */
function activateStartSelection() {
    if (isAnimating || isTrainingAnimating) return;
    
    selectionMode = 'start';
    document.getElementById('select-start-btn').classList.add('active');
    document.getElementById('select-end-btn').classList.remove('active');
    document.getElementById('select-obstacle-btn').classList.remove('active');
}

/**
 * Activates end point selection mode
 */
function activateEndSelection() {
    if (isAnimating || isTrainingAnimating) return;
    
    selectionMode = 'end';
    document.getElementById('select-start-btn').classList.remove('active');
    document.getElementById('select-end-btn').classList.add('active');
    document.getElementById('select-obstacle-btn').classList.remove('active');
}

/**
 * Activates obstacle selection mode
 */
function activateObstacleSelection() {
    if (isAnimating || isTrainingAnimating) return;
    
    selectionMode = 'obstacle';
    document.getElementById('select-start-btn').classList.remove('active');
    document.getElementById('select-end-btn').classList.remove('active');
    document.getElementById('select-obstacle-btn').classList.add('active');
}

/**
 * upates the animation speed based on the slider value
 */
function updateAnimationSpeed() {
    // if animation is active, restart with new speed
    if (isAnimating) {
        stopAnimation();
        startAnimation();
    }
    if (isTrainingAnimating) {
        stopTrainingAnimation();
        startTrainingAnimation();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Render the initial grid with server data
    renderGrid();
    
    // Attach event listeners to buttons
    document.getElementById('generate-btn').addEventListener('click', fetchNewGrid);
    document.getElementById('animate-btn').addEventListener('click', toggleAnimation);
    document.getElementById('training-animate-btn').addEventListener('click', toggleTrainingAnimation);
    document.getElementById('select-start-btn').addEventListener('click', activateStartSelection);
    document.getElementById('select-end-btn').addEventListener('click', activateEndSelection);
    document.getElementById('select-obstacle-btn').addEventListener('click', activateObstacleSelection);
    document.getElementById('clear-obstacles-btn').addEventListener('click', clearObstacles);
    
    // Attach event listener to animation speed slider
    document.getElementById('speed-slider').addEventListener('change', updateAnimationSpeed);
    
    // initial training button state
    updateTrainingButtonState();
});