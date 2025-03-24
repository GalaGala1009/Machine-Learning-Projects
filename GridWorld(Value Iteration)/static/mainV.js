//GridWorld with value iteration

let gridSize = initGridSize;
//init
let startRow = 0;
let startCol = 0;
let endRow = gridSize - 1;
let endCol = gridSize - 1;

let obstacles = [];

//policy and value matrix
let policy = [];
let value = [];
const actions = [
    [-1, 0],  // Up
    [1, 0],   // Down
    [0, -1],  // left
    [0, 1]    // Right
];


let selectMode = null;



function renderGrid() {
    const gridContainer = document.querySelector('.grid-container');
    
    document.querySelector('h3').textContent = `${gridSize} x ${gridSize} Grid`;

    // Clear existing grid
    gridContainer.innerHTML = '';

    // Set the grid template
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`;

    // Create cells
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${row}-${col}`;
            //cell.textContent = `(${row}, ${col})`;
            cell.textContent = `${row*gridSize+col+1}`;
            
            // Add click event listener for cell selection
            cell.addEventListener('click', () => handleCellClick(row, col));

            gridContainer.appendChild(cell);
        }
    }

    // Highlight start, end, and obstacle cells
    highlightStartCell();
    highlightEndCell();
    highlightObsCells();

    //calcuate policy and value matrix
    renderPolicyMatrix();
    renderValueMatrix();
}




function renderPolicyMatrix() {
    const policyMatrix = document.querySelector('.policy-matrix');

    // Clear existing grid
    policyMatrix.innerHTML = '';

    // Set the grid template
    policyMatrix.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`;

    // Create cells
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'pcell';
            cell.id = `pm-${row}-${col}`;
            policyMatrix.appendChild(cell);
        }
    }
}


function showPolicy(){
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.getElementById( `pm-${row}-${col}`);
            if(cell){
                cell.innerHTML = '';
                if(policy[row][col][0] === 1){
                    const arrowUp = document.createElement('div');
                    arrowUp.className = 'arrow up';
                    cell.appendChild(arrowUp);
                }
                if(policy[row][col][1] === 1){
                    const arrowDown = document.createElement('div');
                    arrowDown.className = 'arrow down';
                    cell.appendChild(arrowDown);
                }
                
                if(policy[row][col][2] === 1){
                    const arrowLeft = document.createElement('div');
                    arrowLeft.className = 'arrow left';
                    cell.appendChild(arrowLeft);
                }
                
                if(policy[row][col][3] === 1){
                    const arrowRight = document.createElement('div');
                    arrowRight.className = 'arrow right';
                    cell.appendChild(arrowRight);
                }
            }
        }
    }

}



function renderValueMatrix() {
    const valueMatrix = document.querySelector('.value-matrix');

    // Clear existing grid
    valueMatrix.innerHTML = '';

    // Set the grid template
    valueMatrix.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`;

    value = [];

    // Create cells
    for (let row = 0; row < gridSize; row++) {
        r  = [];
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'vcell';
            cell.id = `vm-${row}-${col}`;
            //cell.textContent = `(${row}, ${col})`;
            cell.textContent = `v${row*gridSize+col+1}`;
            
            r.push(0.0);

            valueMatrix.appendChild(cell);
        }
        value.push(r);
    }

    // Update policy and value matrix   
    valueiteration();
    showPolicy();
    showValue();
}



function valueiteration(){
    //initialize value function
    for(let i=0; i<gridSize; i++){
        for(let j=0; j<gridSize; j++){
            value[i][j] = 0.0;
        }
    }

    //initialize policy 
    policy = [];

    for (let row = 0; row < gridSize; row++) {
        r = [];
        for (let col = 0; col < gridSize; col++) {
            r.push([1, 1, 1, 1]);
        }
        policy.push(r);
    }

    for(let i=0; i<obstacles.length; i++){
        policy[obstacles[i][0]][obstacles[i][1]] = [0, 0, 0, 0];
    }

    policy[endRow][endCol] = [0, 0, 0, 0];

    //hyper parameters
    const gamma = 0.9; // discount value
    const theta = 0.001; 
    const max_iterations = 1000

    for(let l=0;l<max_iterations;l++){
        let delta = 0.0;
        
        for(let i=0; i<gridSize; i++){
            for(let j=0; j<gridSize; j++){
                if (policy[i][j].every(v => v === 0)) continue;

                let stateValue = value[i][j];
                let bestValue = -Infinity;
                let actionVal = [];

                for (let a = 0; a < actions.length; a++) {
                    let [di, dj] = actions[a];
                    let ni = i + di, nj = j + dj;
                    
                    let reward = -0.1;

                    if (ni >= 0 && ni < gridSize && nj >= 0 && nj < gridSize) {
                        if(ni === endRow && nj === endCol) reward = 10;
                        else if(ni === startRow && nj === startCol) reward = 0;

                        let newValue = reward + gamma * value[ni][nj];
                        actionVal.push(newValue);
                        bestValue = Math.max(bestValue, newValue);
                    } else {
                        let newValue = -0.1 + gamma * value[i][j];
                        actionVal.push(newValue);
                        bestValue = Math.max(bestValue, newValue);
                    }
                }
            
                value[i][j] = bestValue;   
                policy[i][j] = [0, 0, 0, 0];

                for(let a = 0; a < 4; a++){
                    if (Math.abs(actionVal[a] - bestValue) < 1e-10 ) {
                        policy[i][j][a] = 1;
                    }
                }
                
                delta = Math.max(delta, Math.abs(value[i][j] - stateValue));
            }
        }

       
        if (delta < theta) break; // end condiction
    }
}


function showValue(){
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.getElementById( `vm-${row}-${col}`);
            if(cell){
                cell.textContent = value[row][col].toFixed(3);
            }
        }
    }
}

function handleCellClick(row, col) {    
    // Check if the cell is the start or end point
    const isStart = (row === startRow && col === startCol);
    const isEnd = (row === endRow && col === endCol);
    
    if (selectMode === 'start') {
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
        highlightObsCells();

        // Update policy and value matrix      
        valueiteration();
        showPolicy();
        showValue();
    }
    else if (selectMode === 'end') {
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
        highlightObsCells();

        // Update policy and value matrix   
        valueiteration();
        showPolicy();
        showValue();
    }
    else if (selectMode === 'obs') {
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
                //generate policy for deleted obstacle
                highlightObsCells();

                // Update policy and value matrix   
                valueiteration();
                showPolicy();
                showValue();
        
                return;
            }
        }

        if(obstacles.length > gridSize - 3){
            return;
        }

        // Add new obstacle
        obstacles.push([row, col]);

        // Update policy and value matrix   
        valueiteration();
        showPolicy();
        showValue();

        // Update display
        highlightObsCells();
    }
}




function activateStartSelection() {
    selectMode = 'start';
    document.getElementById('select-start-btn').classList.add('active');
    document.getElementById('select-end-btn').classList.remove('active');
    document.getElementById('select-obs-btn').classList.remove('active');
}


function activateEndSelection() {
    selectMode = 'end';
    document.getElementById('select-start-btn').classList.remove('active');
    document.getElementById('select-end-btn').classList.add('active');
    document.getElementById('select-obs-btn').classList.remove('active');
}

function activateObsSelection() {
    selectMode = 'obs';
    document.getElementById('select-start-btn').classList.remove('active');
    document.getElementById('select-end-btn').classList.remove('active');
    document.getElementById('select-obs-btn').classList.add('active');
}


//Highlights the start cell
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

//Highlights the end cell
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


//Highlights obstacle cells
function highlightObsCells() {
    // Clear existing obstacle highlights
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('obs');
    });
    
    // Highlight all obstacles
    for (const obstacle of obstacles) {
        const obstacleCell = document.getElementById(`cell-${obstacle[0]}-${obstacle[1]}`);
        if (obstacleCell) {
            obstacleCell.classList.add('obs');
        }
    }
}


document.addEventListener('DOMContentLoaded', function() {
    renderGrid(); // Initialize the grid when the DOM is loaded

    document.getElementById('generate-btn').addEventListener('click', () => {
        gridSize = parseInt(document.getElementById('grid-size').value) || 5;
        startRow = 0;
        startCol = 0;
        endRow = gridSize - 1;
        endCol = gridSize - 1;
        obstacles = [];
        renderGrid();
    });

    document.getElementById('select-start-btn').addEventListener('click', activateStartSelection);
    document.getElementById('select-end-btn').addEventListener('click', activateEndSelection);
    document.getElementById('select-obs-btn').addEventListener('click', activateObsSelection);

});
