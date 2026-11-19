# tmp_pages

各類臨時網頁的共用專案，每個網頁獨立放在自己的子目錄中。

儲存庫採底線命名法（snake_case）；`bestie/` 僅存放 BESTie 觀看頁。

| 目錄 | 內容 |
| --- | --- |
| [bestie/](bestie/) | BESTie 電台繁體中文字幕觀看頁 |

在儲存庫根目錄執行 `python3 -m http.server 8765`，再開啟 http://localhost:8765/bestie/ 。

觀看頁說明見 [bestie/README.md](bestie/README.md)。

## GitHub Pages

- 網頁集合：https://harrylin0312.github.io/tmp_pages/
- BESTie 觀看頁：https://harrylin0312.github.io/tmp_pages/bestie/

透過 GitHub Pages 從 `main` 分支根目錄發布，推送後會自動更新。
