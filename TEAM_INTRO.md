# Start Pray 團隊與專案介紹

Start Pray 是一個以禱告、陪伴與真實回應為核心的開源平台。

我們希望建立一個溫暖且可信任的空間，讓正在經歷重擔的人可以安全地說出需要，也讓願意代禱的人能透過文字、語音與實際行動陪伴對方。這不只是一個功能型網站，而是一個讓「需要」被看見、讓「回應」被保存、讓「得勝故事」能被更多人聽見的社群系統。

專案目前正式名稱為 **Start Pray**。

## 專案願景

很多時候，人並不是沒有需要，而是不知道該如何開口；也有很多人願意幫助，卻不知道怎麼更深地進入別人的負擔。

Start Pray 想解決的，是這兩者之間的距離。

我們希望使用者可以用簡單的方式建立代禱事項，也可以用溫柔、真實的方式回應他人。平台透過禱告牆、全球禱告地圖、語音回應與會員中心，讓每一個需要都能被整理、被看見，也被持續守望。

## 核心價值

### 真實陪伴

Start Pray 鼓勵使用者用文字與語音回應代禱事項。文字適合整理重點，聲音則能承載更多情感與溫度，讓收到回應的人感受到真實的陪伴。

### 安全表達

不是每一個代禱事項都適合完整公開。平台支援私密代禱與匿名大致位置顯示，讓使用者可以在保有安全感的前提下被守望。

### 溫暖但有秩序的社群

平台提供檢舉、封鎖、內容管理與後台審核能力，讓社群可以在彼此尊重的環境中運作。

### 開放協作

Start Pray 歡迎開發者、設計師、教會同工、翻譯者、內容夥伴與代禱者一起參與。這個平台的目標不是單向發布，而是讓更多人共同建造。

## 使用者功能

### 禱告牆

使用者可以瀏覽公開的代禱事項，依分類查看不同需要，例如世界局勢、福音、健康、家庭與個人狀況。每一張代禱卡都可以承載標題、內容、圖片、分類、位置與回應紀錄。

### 建立代禱卡

登入後，使用者可以建立自己的代禱卡，填寫標題、代禱內容、分類與大致位置。若沒有上傳圖片，系統會自動產生黑底白字的標題縮圖，降低建立門檻，讓分享可以更快開始。

### 全球禱告室

代禱事項會以大致位置呈現在全球地圖上，讓使用者看見世界各地正在被守望的需要。私密代禱不公開標題與內容，只保留匿名光點與統計，兼顧陪伴與隱私。

### 文字與語音回應

使用者可以對代禱事項留下文字回應，也可以錄製或提供語音禱告。語音回應讓陪伴更貼近真實關係，也讓需要的人能聽見具體的祝福與支持。

### 會員中心

會員中心提供個人資料管理、代禱卡管理、回應紀錄、公開狀態切換與內容編輯。使用者可以掌握自己建立的內容，也能回顧自己收到或給出的回應。

### 得勝者故事

Start Pray 不只記錄需要，也希望記錄走過困難後的見證。得勝者頁面讓使用者可以整理個人故事、公開個人簡介，並讓社群看見盼望如何延續。

### 隱私與檢舉機制

平台支援私密代禱、內容檢舉、使用者檢舉與管理端審核。這些設計是為了讓社群保持溫暖，同時也能處理不適當內容與濫用行為。

## 管理功能

Start Pray 內建管理後台，協助維護平台內容與使用者狀態。

主要管理能力包含：

- 使用者帳號與狀態管理
- 代禱卡內容管理
- 回應內容管理
- 檢舉紀錄處理
- 首頁與分類內容管理
- 系統設定與維護模式
- 管理員帳號與操作紀錄

這些功能讓平台不只是可以展示內容，也具備長期營運所需的基本治理能力。

## 技術架構

Start Pray 採用 Next.js App Router 架構，將前台頁面、會員功能、管理後台與 API routes 整合在同一個應用中。

### 前端

- **Framework**: Next.js 14 App Router
- **UI Layer**: React 18
- **Rendering Model**: Server Components 與 Client Components 混合使用
- **Styling**: Global CSS、主題 CSS、局部 `style jsx`
- **Responsive Design**: 支援桌面與手機版，包含導覽列、Footer、會員中心與建立流程的響應式介面

前端目前以清楚、穩定、容易維護為優先，不依賴過度複雜的 UI framework。主要共用元件放在 `src/components`，頁面入口則集中於 `src/app`。

### 後端與 API

Next.js API routes 負責處理前台資料、會員操作、管理端操作與媒體上傳。

主要 API 模組包含：

- `GET /api/home-cards`: 取得公開代禱卡列表
- `POST /api/home-cards`: 建立代禱卡
- `GET /api/home-cards/[id]`: 取得單一代禱卡
- `GET /api/customer/cards`: 取得會員自己的代禱卡
- `GET /api/customer/cards/[id]`: 取得會員單一卡片
- `PUT /api/customer/cards/[id]`: 更新會員代禱卡
- `PATCH /api/customer/cards/[id]`: 更新卡片公開狀態
- `DELETE /api/customer/cards/[id]`: 刪除會員代禱卡
- `GET/PUT /api/customer/profile`: 會員個人資料
- `GET /api/customer/responses`: 會員回應紀錄
- `POST /api/upload-image`: 圖片上傳與壓縮
- `GET /api/card-thumbnail`: 產生預設 SVG 縮圖
- `GET/POST/PATCH` under `/api/admin/*`: 管理端功能

API 設計以清楚的 resource boundary 為主，將公開資料、會員資料與管理資料分開處理，避免權限責任混雜。

### 資料庫

- **Database**: MySQL
- **ORM**: Prisma
- **Schema**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations`

主要資料模型包含：

- `User`: 使用者帳號、公開資料、個人狀態
- `HomePrayerCard`: 代禱卡主體資料
- `HomePrayerCategory`: 代禱卡分類
- `PrayerResponse`: 文字或語音回應
- `HomePrayerCardReport`: 代禱卡檢舉
- `PrayerResponseReport`: 回應檢舉
- `OvercomerUserReport`: 得勝者檢舉
- `AdminAccount`: 管理員帳號
- `AdminLog`: 管理端操作紀錄
- `SiteBanner`: 首頁 Banner 設定
- `SiteSetting`: 系統設定

資料模型設計上，代禱卡是目前前台內容的主要單位，回應、分類、檢舉與會員資料都圍繞這個核心模型擴展。

### 認證與權限

平台區分一般會員與管理員。

會員功能透過 session helper 驗證登入狀態，並在 API 層檢查使用者是否仍為可用帳號。管理端則有獨立的管理員 session 與權限檢查，避免一般會員功能與後台功能混用。

相關邏輯主要位於：

- `src/lib/server-session.js`
- `src/lib/customer-session.js`
- `src/lib/customer-access.js`
- `src/lib/admin-session.js`
- `src/lib/admin-route-auth.js`

### 媒體處理

Start Pray 支援圖片與語音相關內容。

圖片上傳流程會驗證檔案類型與大小，並使用 `sharp` 壓縮為 WebP，以降低儲存與載入成本。若使用者建立代禱卡時沒有提供圖片，系統會使用 SVG 動態產生預設縮圖，讓資料仍有穩定的視覺呈現。

相關檔案：

- `src/app/api/upload-image/route.js`
- `src/app/api/card-thumbnail/route.js`
- `src/lib/server-media-storage.js`
- `src/lib/default-thumbnail.js`

### 全球禱告室

全球禱告室使用代禱卡中的地理欄位顯示大致位置。資料會經由後端整理後傳入前端地圖元件，讓公開代禱可以呈現為地圖上的光點。

相關檔案：

- `src/app/global-prayer-room/page.js`
- `src/components/GlobalPrayerRoom.js`
- `src/lib/prayerLocations.js`

私密代禱會避免公開標題、內文、圖片與使用者資訊，只保留匿名位置訊號，讓功能仍能呈現社群守望感，同時保護使用者。

## 專案目錄概覽

```text
src/
  app/                  Next.js App Router pages and API routes
  components/           Shared UI components
  context/              Client-side context providers
  hooks/                Reusable React hooks
  lib/                  Server/client utilities and domain helpers
  styles/               Theme and page-level CSS
  data/                 Static fallback data

prisma/
  schema.prisma         Database schema
  migrations/           Database migrations

public/
  img/                  Static images
  legacy/               Legacy static pages

scripts/                Seed, QA, deploy, and maintenance scripts
```

## 本機開發

常用指令：

```bash
npm install
npm run dev
npm run lint
npm run build
npx prisma generate
npx prisma migrate deploy
```

開發時建議先確認 `.env` 中的資料庫與 session 相關設定，再啟動本機服務。

## 協作方向

目前適合參與的方向包含：

- 前端體驗優化：手機版流程、會員中心、代禱卡建立與回應體驗
- 後端 API 整理：權限檢查、錯誤訊息、資料驗證、測試覆蓋
- 全球禱告室優化：地圖效能、互動設計、私密資料呈現策略
- 內容與翻譯：繁中、英文與教會使用情境的文字整理
- 管理後台改善：檢舉流程、內容審核、使用者管理與操作紀錄
- 部署與維運：環境設定、資料備份、監控與文件化

## 給參與者的一段話

Start Pray 的技術目標，是建立一個穩定、可維護、可擴展的平台。

Start Pray 的核心目標，則是讓正在需要幫助的人被溫柔地接住。

如果你是開發者，你的每一次重構、每一次修 bug、每一次讓流程變得更清楚，都可能讓某個使用者更容易說出自己的需要。

如果你是設計師、文字工作者、教會同工或代禱者，你的參與也同樣重要。因為這個平台不是只靠程式運作，而是靠一群願意愛人、陪伴人、守望人的夥伴一起建造。

願 Start Pray 成為一個讓人感受到愛、盼望與真實陪伴的地方。

## 聯絡方式

Email:

```text
startpraynow@gmail.com
```

GitHub:

```text
https://github.com/dan40912/Start-Pray
```
