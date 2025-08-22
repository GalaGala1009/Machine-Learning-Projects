# Maze_DRL

本專案為一個以深度強化學習（Deep Reinforcement Learning, DRL）解決迷宮（Maze）問題的實作。你可以利用不同的 RL agent 訓練智能體在迷宮中找到最短路徑，並支援自訂迷宮結構。

## 特色

- 支援自訂迷宮地圖
- 可切換不同 RL agent（如 DQN、SAC 等）
- 訓練過程可視覺化
- 支援儲存與載入訓練模型

## 目錄結構

```
Maze_DRL/
│
├── env             
│   └── env.py               # 迷宮環境定義
├── agents             
│   └── dqn_agent.py         # DQN agent 實作
├── utils                    # 輔助工具
│   └── maze_generator.py    # 用來生成迷宮 
├── train.ipynb              # 用於訓練 drl agent 的主要檔案
├── test_env.ipynb           # 用於測試迷宮
└── README.md                # 專案說明

```

## 安裝方式

1. **安裝相依套件**
   ```bash
   pip install -r requirements.txt
   ```

2. **執行主程式**
   ```bash
   python train.py
   ```

## 使用說明

- 可在 `train.py` 設定訓練參數與選擇 agent。
- 迷宮地圖可於 `env.py` 修改或自訂。
- 訓練過程與結果會輸出於終端機，部分版本支援視覺化。

## .gitignore 說明

- `__pycache__/`：排除 Python 編譯快取
- `sac_agent.py`：未完成

---

如有問題或建議，歡迎提出 Issue 或 PR！
