
# Maze_DRL

本專案為一個以深度強化學習（Deep Reinforcement Learning, DRL）解決迷宮（Maze）問題的實作。你可以利用不同的 RL agent 訓練智能體在迷宮中找到最短路徑，並支援自訂迷宮結構。

## 特色

- 支援自訂迷宮地圖
- 可切換不同 RL agent（如 DQN、SAC 等）
- 訓練過程可視覺化
- 支援儲存與載入訓練模型

## 目錄結構

```
maze_DRL/
│
├── main.py            # 主程式，啟動訓練與測試
├── env.py             # 迷宮環境定義
├── agent.py           # RL agent 實作
├── sac_agent.py       # SAC agent 實作（已在 .gitignore 排除）
├── utils.py           # 輔助工具
├── README.md          # 專案說明
├── __pycache__/       # Python 快取資料夾（已在 .gitignore 排除）
└── ...                # 其他相關檔案
```

## 安裝方式

1. **安裝相依套件**
   ```bash
   pip install -r requirements.txt
   ```

2. **執行主程式**
   ```bash
   python main.py
   ```

## 使用說明

- 可在 `main.py` 設定訓練參數與選擇 agent。
- 迷宮地圖可於 `env.py` 修改或自訂。
- 訓練過程與結果會輸出於終端機，部分版本支援視覺化。

## .gitignore 說明

- `__pycache__/`：排除 Python 編譯快取
- `sac_agent.py`：如有敏感或大型模型檔案不納入版本控管

## 參考資料

- Sutton & Barto, Reinforcement Learning: An Introduction
- OpenAI Gym
- [Deep Reinforcement Learning Tutorials](https://pytorch.org/tutorials/intermediate/reinforcement_q_learning.html)

---

如有問題或建議，歡迎提出 Issue 或 PR！