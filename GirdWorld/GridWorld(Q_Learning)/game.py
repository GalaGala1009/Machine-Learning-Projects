import numpy as np
import matplotlib.pyplot as plt
from qAgent import Q_Agent
from gridWorld import GridWorld


def play(env, agent, trials=500, max_steps_per_episode=1000):

    rewards_per_episode = []
    all_training_process = []
    all_training_process.append(env.curPos)

    for trial in range(trials):
        cumulative_reward = 0
        step = 0
        game_over = False
        while step < max_steps_per_episode and game_over!=True:
            oldPos = env.curPos
            action = agent.choose_action(oldPos)
            reward = env.move(action)
            newPos = env.curPos
            
            all_training_process.append(env.curPos)

            agent.learn(oldPos, reward, newPos, action)
            cumulative_reward += reward
            step += 1

            if env.checkState() == "Terminal":
                env.__init__(size=env.size, start=env.start, end = env.end ,obstacles=env.obstacles) # Reset the environment
                game_over = True
        
        rewards_per_episode.append(cumulative_reward)

    return rewards_per_episode, all_training_process


def find_best_path(agent, env):
    path = []
    env.curPos = env.start
    path.append(env.curPos)

    while env.curPos != env.end:
        # choose max q_value action
        q_values = agent.qTable[env.curPos]
        best_action = max(q_values, key=q_values.get)

        # action
        env.move(best_action)
        path.append(env.curPos)

        if env.checkState() == "Terminal":
            break

    return path


