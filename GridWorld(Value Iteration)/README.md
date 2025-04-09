# GridWorld Visualization Project
This project is a web-based visualization tool for GridWorld, built using Flask and JavaScript, to demonstrate reinforcement learning concepts such as Policy Evaluation and Value Iteration.

# How to Run Code
1. Prerequisites:
  * Python 3.x installed
2. Project Structure:
```
GridWorld(Value Iteration)/
├── app.py
├── templates/
│ └── index.html
|── static/
| └── mainV.js
| └── styleV.js
└── README.md
```
3. Steps to Run:
* Clone or download the project repository
* Install require packages
```
python install -r requirements.txt
```
* Open a terminal and navigate to the project directory:
```
 cd GridWorld(Value Ineration)
 #Run the Flask application:
 python app.py
```
4. Open a web browser and visit:
```
http://127.0.0.1:5000
```
5. Interact with the interface:
* Click「Generate Grid」to generate n * n grid
* Choose positions of start, end, and obstacles
* It will calculate policty and value matrix automatically
