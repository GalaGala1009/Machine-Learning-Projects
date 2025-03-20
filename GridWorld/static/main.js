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

    generateRandomPolicy();
    showPolicy();
    
}

function generateRandomPolicy(){
    policy = [];

    for (let row = 0; row < gridSize; row++) {
        r = [];
        for (let col = 0; col < gridSize; col++) {
            arr = [];
            let collision = false;

            for(let i=0; i<obstacles.length; i++){
                if(row === obstacles[i][0] && col === obstacles[i][1]){
                    arr.push([0, 0, 0, 0]);
                    collision = true;
                    break;
                }
            }

            if(collision === false){
                for(let a=0; a<4; a++){
                    arr.push(Math.floor(Math.random() * 2));
                }
            }
            r.push(arr);
        }
        policy.push(r);
    }
    policy[startRow][startCol] = [1, 1, 1, 1];
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
                    arr[0] = 1;
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

    calcuateValueFunc();
    showValue();
}



function calcuateValueFunc(){
    for(let i=0;i<gridSize; i++){
        for(let j=0;j<gridSize; j++){
            value[i][j] = 0.0;
        }
    }

    const gamma = 0.9;
    const theta = 0.001;
    const max_iterations = 1000;

    value[endRow][endCol] = 1.0;

    for(let g=0;g<max_iterations; g++){
        delta = 0.0;
        for(let i=0;i<gridSize; i++){
            for(let j=0;j<gridSize; j++){
                for(let o=0;o<obstacles.length; o++){
                    if(i === obstacles[o][0] && j === obstacles[o][1]){
                        continue;
                    }
                }

                let v = value[i][j];
                let new_v = 0.0;
                let actions = 0.0;
                for(let a=0;a<4; a++){
                    if(policy[i][j][a] === 1){
                        actions += 1.0;
                    }
                }
                
                if(actions !== 0){
                    if(policy[i][j][0] === 1 && i>0){
                        let next_i = i-1;
                        let next_j = j;
                        let reward = 0.0;
                        for(let o=0;o<obstacles.length; o++){
                            if(next_i === obstacles[o][0] && next_j === obstacles[o][1]){
                                next_i = i;
                                next_j = j;
                            }
                        }
                        if(next_i === endRow && next_j === endCol){
                            reward = 1.0;
                        }
                        let action_value = reward + gamma * value[next_i][next_j];
                        new_v += action_value / actions;
                    }
                    if(policy[i][j][1] === 1 && i<gridSize-1){
                        let next_i = i+1;
                        let next_j = j;
                        let reward = 0.0;
                        for(let o=0;o<obstacles.length; o++){
                            if(next_i === obstacles[o][0] && next_j === obstacles[o][1]){
                                next_i = i;
                                next_j = j;
                            }
                        }
                        if(next_i === endRow && next_j === endCol){
                            reward = 1.0;
                        }
                        let action_value = reward + gamma * value[next_i][next_j];
                        new_v += action_value / actions;
                    }
                    if(policy[i][j][2] === 1 && j>0){
                        let next_j = j-1;
                        let next_i = i;
                        let reward = 0.0;
                        for(let o=0;o<obstacles.length; o++){
                            if(next_i === obstacles[o][0] && next_j === obstacles[o][1]){
                                next_i = i;
                                next_j = j;
                            }
                        }
                        if(next_i === endRow && next_j === endCol){
                            reward = 1.0;
                        }
                        let action_value = reward + gamma * value[next_i][next_j];
                        new_v += action_value / actions;
                    }
                    if(policy[i][j][3] === 1 && j<gridSize-1){
                        let next_j = j+1;
                        let next_i = i;
                        let reward = 0.0;
                        for(let o=0;o<obstacles.length; o++){
                            if(next_i === obstacles[o][0] && next_j === obstacles[o][1]){
                                next_i = i;
                                next_j = j;
                            }
                        }
                        if(next_i === endRow && next_j === endCol){
                            reward = 1.0;
                        }
                        let action_value = reward + gamma * value[next_i][next_j];
                        new_v += action_value / actions;
                    }
    
                    value[i][j] = new_v;
                    delta = Math.max(delta, Math.abs(v - new_v));                    
                }

            }

            if(delta < theta) break;
        }
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
        policy[row][col] = [1, 1, 1, 1];
        showPolicy();
        
        calcuateValueFunc();
        showValue();

        // Reset selection mode
        //selectMode = null;
        //document.getElementById('select-start-btn').classList.remove('active');
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

        calcuateValueFunc();
        showValue();

        // Reset selection mode
        //selectMode = null;
        //document.getElementById('select-end-btn').classList.remove('active');
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
                arr = [];
                for(let i=0; i<4; i++){
                    arr.push(Math.floor(Math.random() * 2));
                }
                policy[row][col] = arr;
                highlightObsCells();
                showPolicy();
                return;
            }
        }

        if(obstacles.length > gridSize - 3){
            return;
        }

        // Add new obstacle
        obstacles.push([row, col]);

        policy[row][col] = [0, 0, 0, 0];
        showPolicy();
        calcuateValueFunc();
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
