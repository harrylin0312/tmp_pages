# BESTie 繁體中文字幕觀看頁（臨時專案）

獨立保存 BESTie 電台訪談觀看頁。影片使用 SBS 原始 YouTube 嵌入播放器，未包含影音檔案。

- 原片：https://www.youtube.com/watch?v=lZVbK5Iz-_A
- 現有觀看網址：https://bestie-radio-zh-261118.hichipipo.chatgpt.site?v=3
- 727 段繁體中文字幕；韓文原文可選顯示。
- 手機橫屏專注模式、浮動字幕、自動隱藏控制列。
- 支援字幕大小、時間微調、播放速度、逐字稿搜尋跳轉與 SRT 下載。

字幕由韓語音訊辨識及翻譯後校訂，仍可能含有辨識或翻譯誤差，並非官方字幕；演唱段落顯示曲名提示。

## 本機執行

```sh
python3 -m http.server 8765
```

使用瀏覽器開啟 http://localhost:8765 。此頁需網路連線才能播放 YouTube 影片。

## 檔案

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 觀看頁與操作介面 |
| `style.css` | 響應式版面及字幕樣式 |
| `app.js` | 播放、同步字幕與控制邏輯 |
| `subtitles.json` | 以秒計算的中韓字幕時間軸 |

這是臨時儲存庫，不會自動刪除。GitHub 儲存原始碼；既有 Sites 觀看網址的部署仍獨立管理。
