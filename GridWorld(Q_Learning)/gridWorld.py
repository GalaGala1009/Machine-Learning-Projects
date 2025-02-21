import numpy as np

class GridWorld:
    def __init__(self, start, end, size, obstacles):
        self.size = size
        self.start = start
        self.end = end

        self.obstacles = obstacles
        self.actions = ['up', 'down', 'left', 'right']
        self.grid = np.zeros((size, size)) - 1 
        self.curPos = self.start
        
        #set obstacles
        for i in obstacles:
            self.grid[i[0]][i[1]] = -10

        #set end
        self.grid[self.end[0]][self.end[1]] = 10
    
    def get_reward(self, pos):
        return self.grid[pos[0]][pos[1]]
    
    def move(self, action):
        lastPos = self.curPos

        if action == 'up':
            if lastPos[0] == 0 :
                reward = self.get_reward(lastPos)
            else:
                self.curPos = (self.curPos[0]-1, self.curPos[1])
                reward = self.get_reward(self.curPos)
        
        elif action == 'down':
            if lastPos[0] == self.size-1:
                reward = self.get_reward(lastPos)
            else:  
                self.curPos = (self.curPos[0]+1, self.curPos[1])
                reward = self.get_reward(self.curPos)
        
        elif action == 'left':
            if lastPos[1] == 0:
                reward = self.get_reward(lastPos)
            else:
                self.curPos = (self.curPos[0], self.curPos[1]-1)
                reward = self.get_reward(self.curPos)
        
        elif action == 'right':
            if lastPos[1] == self.size-1:
                reward = self.get_reward(lastPos)
            else:
                self.curPos = (self.curPos[0], self.curPos[1]+1)
                reward = self.get_reward(self.curPos)
    
        return reward

    def checkState(self):
        if self.curPos == self.end or self.curPos in self.obstacles:
            return "Terminal"
        return "Ongoing"