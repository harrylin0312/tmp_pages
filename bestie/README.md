# BESTie 繁體中文字幕觀看頁

獨立保存 BESTie 電台訪談觀看頁。影片使用 SBS 原始 YouTube 嵌入播放器，未包含影音檔案。

- 原片：https://www.youtube.com/watch?v=lZVbK5Iz-_A
- 現有觀看網址：https://harrylin0312.github.io/tmp_pages/bestie/
- 727 段繁體中文字幕；韓文原文可選顯示。
- 手機橫屏專注模式、浮動字幕、自動隱藏控制列。
- 支援字幕大小、時間微調、播放速度、逐字稿搜尋跳轉與 SRT 下載。

字幕由韓語音訊辨識及翻譯後校訂，仍可能含有辨識或翻譯誤差，並非官方字幕；演唱段落顯示曲名提示。

## 本機執行

```sh
python3 -m http.server 8765
# 在儲存庫根目錄執行
```

使用瀏覽器開啟 http://localhost:8765/bestie/ 。此頁需網路連線才能播放 YouTube 影片。

## 檔案

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 觀看頁與操作介面 |
| `style.css` | 響應式版面及字幕樣式 |
| `app.js` | 播放、同步字幕與控制邏輯 |
| `subtitles.json` | 以秒計算的中韓字幕時間軸 |

此頁位於 `tmp_pages/bestie/`。`tmp_pages` 是各類臨時網頁的集合，不會自動刪除。GitHub 儲存原始碼，並使用 GitHub Pages 發布觀看頁。

## 播放操作

- 點一下畫面：播放／暫停。
- 左側雙擊：倒退 5 秒；右側雙擊：快轉 5 秒。連續點擊同側可累加。
- 暫停時快轉／倒退，會保留暫停狀態。
- 拖曳紅色進度列跳轉，齒輪內可調整字幕大小與韓文顯示。
- 全螢幕使用瀏覽器 Fullscreen API；不支援時改用保留字幕的全視窗模式。
- 鍵盤：空白鍵或 K 播放／暫停、左右鍵移動 5 秒、F 切換全螢幕。

手勢檢查：`node --test bestie/player-gestures.test.cjs`。

## 觸控與畫質

- 自訂模式：原生 iframe 使用 `inert`、移除鍵盤焦點並停用指標事件；手勢以 Pointer Events 擷取，阻止相容性 click 重複觸發。
- 畫質：齒輪內選「YouTube 畫質設定」，進入 YouTube 原生模式後，再從原生齒輪選擇解析度。此模式仍顯示中文字幕，自訂觸控與控制列完全停用。
- 可留在原生模式繼續觀看。返回自訂控制會重新建立播放器，保留時間、速度及播放狀態；重新載入後的畫質由 YouTube 決定。
- 原生畫質選單實測可選 1080p；實際選項以影片與 YouTube 提供內容為準。
- 官方 API 不支援程式直接指定畫質，因此沒有使用無效的自訂解析度選單。參考：https://developers.google.com/youtube/iframe_api_revision_history
