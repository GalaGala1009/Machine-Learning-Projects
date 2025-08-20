# GridWorld (Value Iteration & Policy Iteration)

這是一個互動式的 GridWorld 強化學習視覺化工具，支援 Value Iteration 及 Policy Iteration 兩種演算法。使用者可以自訂網格大小、起點、終點與障礙物，並即時觀察策略與價值函數的變化。

## 主要功能

- **自訂網格大小**：可調整 n x n 的方格世界。
- **互動式設定**：點擊選擇起點、終點與障礙物。
- **即時演算法運算**：支援 Value Iteration（mainV.js）與 Policy Iteration（main.js）。
- **視覺化策略與價值矩陣**：以箭頭與數值顯示每格的最佳行動與狀態價值。
- **動態更新**：每次調整設定後即時重新計算並顯示結果。

## 安裝與執行

1. **下載專案**
   ```
   git clone <your-repo-url>
   ```

2. **進入資料夾**
   ```
   cd Machine-Learning-Projects/GridWorld(Value Iteration)
   ```

3. **開啟 index.html**
   - 直接用瀏覽器開啟 `index.html` 即可使用（不需後端）。

## 檔案結構

```
GridWorld(Value Iteration)/
│
├── static/
│   ├── main.js         # Policy Iteration 主程式
│   ├── mainV.js        # Value Iteration 主程式
│   ├── style.css       # 樣式表
│
├── index.html          # 主頁面
└── README.md           # 專案說明
```

## 技術說明

- **前端技術**：純 JavaScript、HTML、CSS
- **主要演算法**：
  - `main.js`：策略迭代（Policy Iteration）
  - mainV.js：價值迭代（Value Iteration）
- **互動設計**：可點擊設定起點、終點、障礙物，並即時更新策略與價值矩陣

## 使用說明

1. **設定網格大小**：輸入數字並點擊「Generate Grid」。
2. **選擇模式**：點擊「Select Start」、「Select End」、「Select Obstacle」切換設定模式。
3. **點擊格子**：在網格上點擊設定起點、終點或障礙物。
4. **觀察結果**：策略（箭頭）與價值（數值）會即時更新。

## 參考

- Sutton & Barto, Reinforcement Learning: An Introduction
- [Value Iteration & Policy Iteration - Wikipedia](https://en.wikipedia.org/wiki/Markov_decision_process#Solution)

---

如需進一步功能或有任何問題，歡迎提出 Issue 或 PR！