import numpy as np
import scipy.special as sp
import matplotlib.pyplot as plt
import copy
import torch
import torch.nn as nn
import torch.optim as optim
import collections
from IPython.display import display, clear_output

Transition = collections.namedtuple('Experience',
                                    field_names=['state', 
                                                 'action',
                                                 'next_state', 
                                                 'reward',
                                                 'is_game_on'])


class ExperienceReplay:
    def __init__(self, capacity):
        self.capacity = capacity
        self.memory = collections.deque(maxlen=capacity)  # 使用 deque 來儲存經驗，超過容量時會刪除最舊的

    def __len__(self):
        return len(self.memory)

    def push(self, transition):
        self.memory.append(transition)

    def sample(self, batch_size, device = 'cuda'):  
        indices = np.random.choice(len(self.memory), batch_size, replace = False)  # 隨機抽取 batch size 筆資料 idx
        
        states, actions, next_states, rewards, isgameon = zip(*[self.memory[idx] 
                                                                for idx in indices])
        # zip(*) 會把多個 tuple 的同一個欄位組成一個 tuple


        # 將 batch 轉成 pytroch tensor 並移到指定 GPU 上

        # \ 行接續符號

        return torch.Tensor(states).type(torch.float).to(device), \
               torch.Tensor(actions).type(torch.long).to(device), \
               torch.Tensor(next_states).to(device), \
               torch.Tensor(rewards).to(device), \
               torch.tensor(isgameon).to(device)




class fc_nn(nn.Module):   # 全連接層
    def __init__(self, Ni, Nh1, Nh2, No = 4):
        super().__init__()
        
        self.fc1 = nn.Linear(Ni, Nh1)
        self.fc2 = nn.Linear(Nh1, Nh2)
        self.fc3 = nn.Linear(Nh2, No)
        
        self.act = nn.ReLU()
        
    def forward(self, x, classification = False, additional_out=False):
        x = self.act(self.fc1(x))
        x = self.act(self.fc2(x))
        out = self.fc3(x)

        # fc1 -> ReLU -> fc2 -> ReLU -> fc3
        
        return out


class DQN_Agent:
    def __init__(self, maze, buffer_capacity = 5000, buffer_start_size = 1000, use_softmax = True):
        self.env = maze
        self.num_act = 4 # action 數量
        self.use_softmax = use_softmax 
        self.total_reward = 0
        self.min_reward = -self.env.maze.size  # 最小 reward 為所有 element : - (20 * 20)
        self.epsilon = 0.9
        self.decay = 0.9999 
        self.isgameon = True # 確認是否在遊戲中
        
        
        self.net = fc_nn(self.env.maze.size, self.env.maze.size, self.env.maze.size, 4)

        self.optimizer = optim.Adam(self.net.parameters(), lr=1e-4)

        self.device = 'cuda'
        self.batch_size = 24
        self.gamma = 0.9

        self.net.to(self.device)

        # buffer
        
        self.buffer_start_size  = buffer_start_size
        self.buffer = ExperienceReplay(buffer_capacity) # this is actually a reference


    def make_a_move(self, device = 'cuda'):
        action = self.select_action(self.net, device)
        current_state = self.env.state()
        next_state, reward, self.isgameon = self.env.state_update(action)
        self.total_reward += reward
        
        if self.total_reward < self.min_reward:   # 當低於最小 reward 則直接結束 
            self.isgameon = False
        if not self.isgameon:
            self.total_reward = 0
        
        transition = Transition(current_state, 
                                action,
                                next_state, 
                                reward,
                                self.isgameon)
        
        self.buffer.push(transition)
            
        
    def select_action(self, net, device = 'cuda'):
        epsilon = self.epsilon

        # 將 maze 從 20 * 20 看成 1 * 400
        state = torch.Tensor(self.env.state()).to(device).view(1, -1)
        qvalues = net(state).cpu().detach().numpy().squeeze()

        # softmax sampling of the qvalues
        if self.use_softmax:
            p = sp.softmax(qvalues/epsilon).squeeze()
            p /= np.sum(p)
            action = np.random.choice(self.num_act, p = p)
            
        # else choose the best action with probability 1-epsilon
        # and with probability epsilon choose at random
        else:
            if np.random.random() < epsilon:
                action = np.random.randint(self.num_act, size=1)[0]
            else:                
                action = np.argmax(qvalues, axis=0)
                action = int(action)
        

        if epsilon > 0.1 : 
            self.epsilon *= self.decay
        


        return action
    
    
    def plot_policy_map(self, filename, offset):
        self.net.eval()
        with torch.no_grad():
            fig, ax = plt.subplots()
            ax.imshow(self.env.maze, 'Greys')

            for free_cell in self.env.allowed_states:
                self.env.current_position = np.asarray(free_cell)
                qvalues = self.net(torch.Tensor(self.env.state()).view(1, -1).to('cuda'))
                action = int(torch.argmax(qvalues).detach().cpu().numpy())
                policy = self.env.directions[action]

                ax.text(free_cell[1]-offset[0], free_cell[0]-offset[1], policy)
            ax = plt.gca()

            plt.xticks([], [])
            plt.yticks([], [])

            ax.plot(self.env.goal[1], self.env.goal[0],
                    'bs', markersize = 4)
            plt.savefig(filename, dpi = 300, bbox_inches = 'tight')
            plt.show()


    def Qloss(self, batch, gamma=0.99, device="cuda"):
        net = self.net
        states, actions, next_states, rewards, _ = batch
        # states : tensor
        # example : 
        # [states1, ..., states32], [actions1, ..., actions32], [], [], []
        # shape : 32, 32, 32, 32, 32
        lbatch = len(states) # lbathc = 32

        # state => lbatch * x => 32 * 1
        """
        => [
            [state1],
            [state2],
            ...
            [state32]
        ]
        """
        state_action_values = net(states.view(lbatch, -1))
        """
        action_values = [
            [left_action_val1, right_action_val1, north_action_val1, sourth_action_val1],
            [],
            ...,
            [left_action_val32, ....],
        ]
        """
        # actions => 32 * 1
        # 根據 action 取得 action values
        state_action_values = state_action_values.gather(1, actions.unsqueeze(-1))

        # action valuse 從 32 * 1 => 32
        state_action_values = state_action_values.squeeze(-1)
        

        # state_valuse = 32 * x
        '''
        state_values = [
            [left_state_val1, right_state_val2, ,...],
            [],
            ...,
            [left_state_val32,...,]
        ]
        '''
        
        next_state_values = net(next_states.view(lbatch, -1))
        next_state_values = next_state_values.max(1)[0] 
        # tensor.max 會回傳一個 tuple : (最大值, 最大值 index)


        # 將 next_state_values 這個 tensor 從目前的計算圖（computation graph）中分離
        # 讓它不會參與之後的反向傳播（backpropagation）與梯度計算。
        next_state_values = next_state_values.detach()
        expected_state_action_values = next_state_values * gamma + rewards
        
        # 計算動作的值和預期的值之間的差異
        return nn.MSELoss()(state_action_values, expected_state_action_values)
    

    def train(self, num_epochs = 1000):
        loss_log = []
        best_loss = 1e5

        running_loss = 0

        for epoch in range(num_epochs):
            loss = 0
            counter = 0
            
            self.isgameon = True
            _ = self.env.reset(self.epsilon)
            
            while self.isgameon:
                self.make_a_move()
                counter += 1
                
                if len(self.buffer) < self.buffer_start_size:
                    continue
                    
                self.optimizer.zero_grad()
                batch = self.buffer.sample(self.batch_size, device = self.device)
                loss_t = self.Qloss(batch, gamma = self.gamma, device = self.device)
                loss_t.backward()
                self.optimizer.step()
                
                loss += loss_t.item()
            
            if (self.env.current_position == self.env.goal).all():
                result = 'won'
            else:
                result = 'lost'
            
            # 用來顯示 policy map
            #if epoch%1000 == 0:
            #    self.plot_policy_map('sol_epoch_'+str(epoch)+'.pdf', [0.35, -0.3])
            
            loss_log.append(loss)
            
            if (epoch > 2000):
                running_loss = np.mean(loss_log[-50:])
                if running_loss < best_loss:
                    best_loss = running_loss
                    torch.save(self.net.state_dict(), "best.torch")
                    estop = epoch
            
            print('Epoch', epoch, '(number of moves ' + str(counter) + ')')
            print('Game', result)
            print('[' + '#'*(100-int(100*(1 - epoch/num_epochs))) +
                ' '*int(100*(1 - epoch/num_epochs)) + ']')
            print('\t Average loss: ' + f'{loss:.5f}')
            if (epoch > 2000):
                print('\t Best average loss of the last 50 epochs: ' + f'{best_loss:.5f}' + ', achieved at epoch', estop)
            clear_output(wait = True)


        return loss_log
    

    def test(self, runs = 1):
        self.net.eval()
        self.isgameon = True
        self.use_softmax = False
        _ = self.env.reset(0)
        while self.isgameon:
            self.make_a_move()
            self.env.draw('')
            clear_output(wait = True)