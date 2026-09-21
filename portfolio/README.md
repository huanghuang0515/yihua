# Yi Hua Huang — Portfolio（Figma 復刻）

依 Figma 設計稿 **Portfolio / `Desktop - 1`（node `1:2`，1440 × 886）** 復刻的靜態首頁，
純 HTML + CSS + JavaScript，**無建置流程、無外部相依**。

設計稿：<https://www.figma.com/design/EKVdtjmJCNxMBSXmmmkjvp/Portfolio?node-id=1-2>

---

## 在 localhost 開起來

```bash
# 專案根目錄（yihua/）
node .claude/static-server.js
# → http://localhost:4173/portfolio/
```

也可以直接用瀏覽器開啟 `portfolio/index.html`（file:// 亦可運作，只是 Google Fonts 需要連線）。

| 網址參數 | 行為 |
| --- | --- |
| （無） | 進站播放一次開場動畫 |
| `?replay` | 強制播放，覆寫系統的「減少動態」設定 |
| `?loop` | 與設計稿 timeline 相同，每 5.8s 無限循環 |

右下角的 **Replay** 按鈕可隨時重播；系統若開啟「減少動態效果」，預設直接顯示完成態。

---

## 檔案結構

```
portfolio/
  index.html                 版面結構（每個區塊都標了對應的 Figma node id）
  assets/css/portfolio.css   版面與動態；時間常數集中在檔頭註解
  assets/img/bird-1~4.svg    設計稿匯出的四隻海鷗
  assets/js/portfolio.js     條紋產生、逐字打字、播放控制
```

---

## 動態順序（Figma timeline 5.8s，逐格對照）

| 時間 | 元素 | 動作 | Figma node |
| --- | --- | --- | --- |
| 0.000 → 0.680s | Header | 由上方 −115px 滑入 ＋ 淡入（ease-out） | `1:1269` |
| 0.800 → 1.350s | 海面區塊 | 淡入 | `3:13617` |
| 1.180 → 2.000s | 太陽 | 由上方 −115px 落下 ＋ 淡入 | `1:61` |
| 1.280s 起 | 海面藍條紋 | 由左而右逐條淡入（每條間隔 21ms、各 160ms） | `1:696`–`1:978` |
| 1.500s 起 | 天空／沙灘條紋 | 由左而右逐條淡入（每條間隔 21ms、各 180ms） | `1:409`–`1:691`、`1:983`–`1:1265` |
| 1.620 → 2.280s | `Yi Hua Huang` | 逐字打出（12 字，每字 55ms） | `5:1201` |
| 1.720 / 2.000 / 2.280 / 2.560s | 海鷗 1–4 | 依序由左下 (−18, +10) 位移入場 ＋ 淡入 | `3:13597` `3:13604` `3:13610` `3:13601` |
| 2.100 → 2.800s | `UI/UX Designer` | 逐字打出（14 字，每字 50ms） | `5:1217` |
| 2.850 → 5.012s | 標語 | 逐字打出（46 字，每字 47ms） | `5:1235` |

打字動畫是逐字量測實際字寬後推進的（與 Figma 的逐字 keyframe 相同），不是等寬 `steps()`。
條紋的左→右掃描總長固定，畫面再寬也維持設計稿的節奏。

---

## 與設計稿的對應

* **座標**：全部以 `--u`（＝ 1 個設計稿 px）換算，視窗窄於 1440 時整體等比縮小，寬於 1440 時版心置中、條紋滿版。
* **字型**：NanumGothic（Google Fonts `Nanum Gothic`），字級／顏色沿用設計稿：標題 28px、副標 25px `#989898`、標語 30px、導覽 20px `#272727`。
* **Header 陰影**：`0 4px 22.1px #ffeef3`。
* **條紋**：間距 15px、寬 7px，三層（天空、沙灘、海面）各自帶垂直漸層；海面層以波浪曲線 `clip-path` 裁切。
* **互動**：導覽與 logo 具 hover／鍵盤 focus 樣式；`prefers-reduced-motion` 與無 JS 時皆退回完成態（條紋改以「漸層 + 遮罩」靜態呈現）。

### 素材

**海鷗是設計稿本體的 SVG**（`assets/img/bird-1~4.svg`）。此環境的網路政策擋掉了 Figma 素材網域
（`www.figma.com` CONNECT 403），無法用 URL 下載匯出檔，因此改用 Plugin API
（`use_figma` → `node.exportAsync({ format: "SVG_STRING" })`）把 SVG 原始碼取回來寫成檔案，
並以長度與 path 雜湊比對確認與設計稿逐字元一致。四隻是四個不同的圖形，不是同一張圖縮放。

位置與尺寸取自 Figma 的 `absoluteBoundingBox`：

| 檔案 | Figma node | 位置（相對 frame） | 尺寸 |
| --- | --- | --- | --- |
| `bird-1.svg` | `3:13597` | 510, 296 | 149 × 57 |
| `bird-2.svg` | `3:13604` | 647, 261 | 132 × 35 |
| `bird-3.svg` | `3:13610` | 824, 325 | 150 × 76 |
| `bird-4.svg` | `3:13601` | 978, 279 | 116 × 82 |

> `bird-4` 在設計稿裡旋轉了 180°，因此 `node.x` 回報的 1094 是旋轉後的原點而非外框左上角；
> 這裡採用 `absoluteBoundingBox` 的 978，匯出的 SVG 已含旋轉後的外觀，不需要再加 CSS rotate。

### 已知落差

1. **logo 橢圓弧線與條紋漸層仍是重製的**（比對設計稿渲染圖以 SVG／CSS 重畫）。
   需要時可用與海鷗相同的方式把原始 SVG 取回替換。
2. **導覽列 ABOUT / PROJECT / RESUME 尚無對應頁面**——設計稿目前只有首屏這一頁，因此連結只有 hover 樣式、點擊不跳轉。
3. **行動版**：設計稿只定義 1440 桌機版，窄螢幕目前是整體等比縮小（不會破版、不會橫向捲動）。
   若要真正的手機版面，需要設計稿補上對應的 frame。
