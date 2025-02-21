import numpy as np

class Q_Agent():

    def __init__(self, env, alpha=0.1, gamma=0.9, epsilon=0.1):
        self.env = env
        self.qTable = dict() #store all q-values in a dictionary

        for i in range(env.size):
            for j in range(env.size):
                self.qTable[(i,j)] = {'up':0, 'down':0, 'left':0, 'right':0}
        
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon

    def choose_action(self, pos):

        if np.random.uniform(0, 1) < self.epsilon:
            action = self.env.actions[np.random.randint(0, len(self.env.actions))]
        else:
            q_values = self.qTable[pos]
            maxVal = max(q_values.values())
            action = np.random.choice([k for k, v in q_values.items() if v == maxVal])
        
        return action
    
    def learn(self, oldPos, reward, newPos, action):
        #update the Q-value table
        new_q_val = self.qTable[newPos]
        max_new_q_val = max(new_q_val.values())
        cur_q_val = self.qTable[oldPos][action]
  
        self.qTable[oldPos][action] = (1-self.alpha)*cur_q_val + self.alpha*(reward + self.gamma*max_new_q_val)

