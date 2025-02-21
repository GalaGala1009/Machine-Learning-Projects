// static/js/main.js
// Global variables
let gridSize = initialGridSize;
let gridData = initialGridData;
let best_path = initialBestPath;
let obstacles = initialObstacles;
let path_len = best_path.length;
let cur_path = 0;
let animationInterval;
let currentRow = best_path[cur_path][0];
let currentCol = best_path[cur_path][1];
let isAnimating = false;

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
            gridContainer.appendChild(cell);
        }
    }
    
    // Highlight the starting cell
    highlightCurrentCell();
    highlightObstacleCell();
    highlightTerminalCell();
}

/**
 * Fetches new grid data from the server
 */
function fetchNewGrid() {
    // Get the grid size from input
    const requestedSize = parseInt(document.getElementById('grid-size').value);
    
    // Fetch new grid data from server
    fetch('/generate-grid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ size: requestedSize })
    })
    .then(response => response.json())
    .then(data => {
        // Update with server data
        gridSize = data.grid_size;
        gridData = data.grid_data;
        best_path = data.best_path;
        obstacles = data.obstacles;


        // Update input to reflect actual size used (in case it was adjusted)
        document.getElementById('grid-size').value = gridSize;

        // Reset animation state
        if (isAnimating) {
            stopAnimation();
        }
    
        path_len = best_path.length;
        cur_path = 0;
        currentRow = best_path[cur_path][0];
        currentCol = best_path[cur_path][1];
        
        
        // Render the new grid
        renderGrid();
    })
    .catch(error => {
        console.error('Error fetching grid data:', error);
    });
}

/**
 * Highlights the current cell in the animation
 */

function highlightTerminalCell() {
    // Add highlight to current cell
    const terminalCell = document.getElementById(`cell-${best_path[path_len-1][0]}-${best_path[path_len-1][1]}`);
    if (terminalCell) {
        terminalCell.classList.add('end');
    }
}

function highlightObstacleCell() {
    var obstaclesCells = [];
    for(var i=0;i<obstacles.length;i++){
        obstaclesCells.push(document.getElementById(`cell-${obstacles[i][0]}-${obstacles[i][1]}`));
        if(obstaclesCells[i]){
            obstaclesCells[i].classList.add('obstacle');
       } 
    }
}


function highlightCurrentCell() {
    // Remove highlight from all cells
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('current');
    });
    
    const endCell = document.getElementById(`cell-${best_path[path_len-1][0]}-${best_path[path_len-1][1]}`);
    if(endCell.classList.contains('end') == false){
        endCell.classList.add('end');
    }
    const currentCell = document.getElementById(`cell-${currentRow}-${currentCol}`);
    // Remove highlight from end cell
    if(currentCell.classList.contains('end')){
        currentCell.classList.remove('end');
    }
    // Add highlight to current cell
    if (currentCell) {
        currentCell.classList.add('current');
    }
}

/**
 * Moves to the next cell in the animation sequence
 * @returns {boolean} Whether the animation can continue
 */
function moveNext() {
    
    // Move to the next cell (row by row, left to right)
    if(cur_path >= path_len-1){
        stopAnimation();
        return false;
    }

    cur_path++;
    currentRow = best_path[cur_path][0];
    currentCol = best_path[cur_path][1];
    
    
    highlightCurrentCell();

    return true;
}

/**
 * Starts the animation
 */
function startAnimation() {
    if (isAnimating) return;
    

    // Reset if we're at the end
    if(cur_path >= path_len-1){
        cur_path = 0;
        currentRow = best_path[cur_path][0];
        currentCol = best_path[cur_path][1];
        highlightCurrentCell();
    }
   
    isAnimating = true;
    document.getElementById('animate-btn').textContent = 'Stop Animation';
    
    // Start the animation interval
    animationInterval = setInterval(() => {
        const canContinue = moveNext();
        if (!canContinue) {
            stopAnimation();
        }
    }, 300); // Moves every 300ms
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Render the initial grid with server data
    renderGrid();
    
    // Attach event listeners to buttons
    document.getElementById('generate-btn').addEventListener('click', fetchNewGrid);
    document.getElementById('animate-btn').addEventListener('click', toggleAnimation);
});