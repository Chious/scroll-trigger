# 🎬 Scroll Trigger Frame Animation

一個使用 Canvas、Lenis 和 ScrollTrigger 實現的幀序列滾動動畫項目。

## 🌐 線上展示

本項目已部署至 GitHub Pages，可直接訪問：

- **Demo**: `https://[你的用戶名].github.io/[倉庫名]/`
- **自動部署**: 每次推送到 main 分支會自動更新

## 📋 項目概述

這是一個展示如何通過滾動控制圖片序列播放的示例項目，特別適合初學者學習 Canvas 渲染和 ScrollTrigger 動畫。

## 🚀 快速開始

### 1. 文件結構

```
scroll-trigger/
├── index.html          # 主頁面
├── script.js           # 動畫邏輯
├── styles.css          # 樣式文件
└── frames/             # 圖片序列資料夾
    ├── frame_0001.jpg
    ├── frame_0002.jpg
    └── ...
    └── frame_0251.jpg
```

### 2. 啟動項目

```bash
# 使用 Python 啟動本地伺服器
python3 -m http.server 8080

# 或使用 Node.js
npx serve .

# 然後開啟瀏覽器訪問
http://localhost:8080
```

## 🖼️ Frames 配置指南

### 圖片序列要求

1. **命名格式**: `frame_XXXX.jpg`

   - 必須是 4 位數字，前面補零
   - 例如: `frame_0001.jpg`, `frame_0002.jpg`

2. **放置位置**:

   - 所有圖片放在 `frames/` 資料夾內
   - 確保資料夾與 `index.html` 在同一層級

3. **圖片規格建議**:
   - 格式: JPG 或 PNG
   - 尺寸: 建議 1920x1080 或更高
   - 檔案大小: 每張 < 200KB（載入速度更佳）

### 修改幀數量

在 `script.js` 中修改這一行：

```javascript
const frameCount = 251; // 改為您的圖片總數
```

### 圖片命名範例

如果您有 100 張圖片：

```
frame_0001.jpg
frame_0002.jpg
frame_0003.jpg
...
frame_0099.jpg
frame_0100.jpg
```

然後設定：

```javascript
const frameCount = 100;
```

## ⚙️ 核心配置

### ScrollTrigger 設定

```javascript
scrollTriggerInstance = ScrollTrigger.create({
  trigger: ".hero",
  start: "top top",
  end: "+=300%", // 滾動距離 (300% = 3倍視窗高度)
  scrub: 0.8, // 滾動響應速度 (0-1)
  pin: true, // 固定區域
  // ... 其他設定
});
```

### Canvas 渲染邏輯

```javascript
function renderFrame(frameIndex) {
  // 載入指定索引的圖片
  const img = images[frameIndex];

  // 計算縮放比例 (保持比例填滿螢幕)
  const scale = Math.max(canvas.width / img.width, canvas.height / img.height);

  // 居中顯示
  const x = canvas.width / 2 - (img.width / 2) * scale;
  const y = canvas.height / 2 - (img.height / 2) * scale;

  // 渲染到 Canvas
  context.drawImage(img, x, y, img.width * scale, img.height * scale);
}
```

## 🎛️ 自訂設定

### 調整滾動速度

```javascript
scrub: 0.8,  // 值越小越靈敏，越大越平滑
```

### 調整滾動距離

```javascript
end: "+=300%",  // 300% = 需要滾動 3 個螢幕高度來播放完整動畫
```

### 修改內容淡出時機

```javascript
if (self.progress > 0.8) {
  // 80% 時開始淡出，可調整為 0.6 或 0.9
  // 淡出邏輯
}
```

## 🛠️ 常見問題

### Q: 圖片載入很慢？

A:

- 壓縮圖片檔案大小
- 減少圖片總數
- 使用 WebP 格式

### Q: 動畫不流暢？

A:

- 檢查圖片命名是否正確
- 確認所有圖片都存在
- 調整 `scrub` 值

### Q: 想要反向播放？

A: 修改幀計算邏輯：

```javascript
const frameIndex = frameCount - 1 - Math.round(frameAnimation.frame);
```

## 📚 核心技術

- **Canvas 2D**: 高效能圖片渲染
- **GSAP ScrollTrigger**: 滾動觸發動畫
- **Lenis**: 平滑滾動體驗
- **Frame Caching**: 防閃爍機制

## 🎯 學習重點

1. **Canvas 基礎**: 學習 2D context 和 drawImage
2. **ScrollTrigger**: 理解 pin、scrub、progress 概念
3. **圖片預載入**: 避免載入延遲
4. **效能優化**: 快取機制和渲染節流

## 🚀 部署到 GitHub Pages

### 自動部署設定

本項目已配置 GitHub Actions 自動部署，每次推送到 main 分支時會自動更新網站。

### 手動部署步驟

1. **推送代碼到 GitHub**:

```bash
git add .
git commit -m "Add frame animation project"
git push origin main
```

2. **啟用 GitHub Pages**:

   - 進入你的 GitHub 倉庫
   - Settings → Pages
   - Source 選擇 "GitHub Actions"
   - 等待部署完成

3. **訪問網站**:
   - URL: `https://[你的用戶名].github.io/[倉庫名]/`
   - 通常需要 1-2 分鐘生效

### 部署文件結構

```
.github/
└── workflows/
    └── deploy.yml    # GitHub Actions 部署配置
```

### 注意事項

- 確保 frames 資料夾包含所有圖片
- 圖片檔案大小建議控制在 200KB 以下
- GitHub Pages 有 1GB 的儲存限制

---

💡 **提示**: 這個項目展示了現代網頁動畫的核心概念，是學習進階動畫效果的絕佳起點！
