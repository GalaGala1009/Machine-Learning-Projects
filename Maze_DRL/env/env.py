import copy
import scipy.special as sp
import numpy as np
from utils.maze_generator import generate_maze
import matplotlib.pyplot as plt

class MazeEnv:    
    def __init__(self, maze, init_position, goal):
        x = len(maze)
        y = len(maze)
        
        self.boundary = np.asarray([x, y])
        self.init_position = init_position
        self.current_position = np.asarray(init_position)
        self.goal = goal
        self.maze = maze
        
        self.visited = set()
        self.visited.add(tuple(self.current_position))
                
        # initialize the empty cells and the euclidean distance from
        # the goal (removing the goal cell itself)

        # 找出所有可以通行的 state 並計算距離
        self.allowed_states = np.asarray(np.where(self.maze == 0)).T.tolist()

        # 計算每個可通行格子到目標點 self.goal 的歐氏距離
        self.distances = np.sqrt(np.sum(
            (np.array(self.allowed_states) - 
             np.asarray(self.goal)) **2, axis = 1))
        
        del(self.allowed_states[np.where(self.distances == 0)[0][0]])
        self.distances = np.delete(self.distances, np.where(self.distances == 0)[0][0])
        # 找出距離為 0 的格子（即目標點本身），並從 allowed_states 和 distances 中刪除，得到除了目標點以外的所有格子

        self.action_map = {0: [0, 1],
                           1: [0, -1],
                           2: [1, 0],
                           3: [-1, 0]}
        
        self.directions = {0: '→',
                           1: '←',
                           2: '↓ ',
                           3: '↑'} 
        
        # the agent makes an action from the following:
        # 1 -> right, 2 -> left
        # 3 -> down, 4 -> up
        
    # introduce a reset policy, so that for high epsilon the initial
    # position is nearer to the goal (useful for large mazes)
    def reset_policy(self, eps, reg = 7):
        return sp.softmax(-self.distances/(reg*(1-eps**(2/reg)))**(reg/2)).squeeze()
    # 這個方法會根據 epsilon 動態調整 agent 重置時的位置分布，讓高 epsilon 時 agent 更容易出現在靠近目標的位置，有助於大迷宮的訓練效率。



    # reset the environment when the game is completed
    # with probability prand the reset is random, otherwise
    # the reset policy at the given epsilon is used
    def reset(self, epsilon, prand = 0):
        if np.random.rand() < prand:
            idx = np.random.choice(len(self.allowed_states))
        else:
            p = self.reset_policy(epsilon)
            idx = np.random.choice(len(self.allowed_states), p = p)

        self.current_position = np.asarray(self.allowed_states[idx])
        
        self.visited = set()
        self.visited.add(tuple(self.current_position))

        return self.state()
    
    
    def state_update(self, action):
        isgameon = True
        
        # each move costs -0.05
        reward = -0.05
        
        move = self.action_map[action]
        next_position = self.current_position + np.asarray(move)
        
        # if the goals has been reached, the reward is 1
        if (self.current_position == self.goal).all():
                reward = 1
                isgameon = False
                return [self.state(), reward, isgameon]
            
        # if the cell has been visited before, the reward is -0.2
        else:
            if tuple(self.current_position) in self.visited:
                reward = -0.2
        
        # if the moves goes out of the maze or to a wall, the
        # reward is -1
        if self.is_state_valid(next_position):
            self.current_position = next_position
        else:
            reward = -1
        
        self.visited.add(tuple(self.current_position))

        return [self.state(), reward, isgameon]

    # return the state to be feeded to the network
    def state(self):
        state = copy.deepcopy(self.maze)
        state[tuple(self.current_position)] = 2
        return state
        
    
    
    def is_state_valid(self, next_position):
        if self.maze[tuple(next_position)] == 1 : 
            return False
        return True
    
    
    def draw(self, filename = None):
        plt.figure()
        im = plt.imshow(self.maze, interpolation='none', aspect='equal', cmap='Greys')
        ax = plt.gca()

        plt.xticks([], [])
        plt.yticks([], [])

        ax.plot(self.goal[1], self.goal[0],
                'bs', markersize = 4)
        ax.plot(self.current_position[1], self.current_position[0],
                'rs', markersize = 4)
        
        if filename : 
            plt.savefig(filename, dpi = 300, bbox_inches = 'tight')
        plt.show()



