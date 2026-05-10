# AI / Maintainer Guide

這份文件是給 AI agent、協作者、或之後接手維護的人看的。

Start Pray 是一個禱告與陪伴平台，不是一般 SaaS。修改時請先理解這個前提：這裡處理的是人的需要、回應、隱私與信任。

## 專案名稱

正式名稱是：

```text
Start Pray
```

程式與文件中不要再使用舊名稱，也不要加入任何過去已移除的金融資產敘事。

即使資料庫或舊檔案裡還有歷史命名，新的使用者文件與新功能都應該使用 `Start Pray`。

## 你應該先讀的文件

如果要理解整體架構：

- `README.md`
- `docs/architecture.md`
- `docs/data-and-auth.md`
- `docs/api.md`

如果要改媒體或圖片：

- `docs/media.md`
- `src/app/api/upload-image/route.js`
- `src/app/api/card-thumbnail/route.js`
- `src/lib/server-media-storage.js`

如果要改管理端或檢舉：

- `docs/admin.md`
- `src/app/admin/*`
- `src/app/api/admin/*`

如果要部署或查環境：

- `docs/deployment.md`
- `deploy.md`
- `PROD_DB_MIGRATION_RUNBOOK.md`
- `MEDIA_STORAGE_RUNBOOK.md`

## 架構簡述

Start Pray 是 Next.js App Router 專案。

```text
src/app              頁面、layout、API routes
src/components       共用 React 元件
src/lib              domain helper、session、server utilities
src/styles           全域與主題 CSS
src/context          client context
src/hooks            reusable hooks
prisma/schema.prisma 資料模型
prisma/migrations    migration
public/img           靜態圖片
scripts              seed、QA、維護腳本
docs                 技術文件
```

主要使用：

- Next.js 14 App Router
- React 18
- Prisma
- MySQL
- plain CSS
- Sharp
- Three.js

## 核心 domain model

目前前台的主要內容單位是 `HomePrayerCard`，不是 `PrayerRequest`。

常見關係：

- `User` 擁有多張 `HomePrayerCard`
- `HomePrayerCard` 屬於一個 `HomePrayerCategory`
- `PrayerResponse` 可以連到 `HomePrayerCard`
- Report models 用於檢舉與管理
- Admin models 用於後台登入與操作紀錄

修改功能前，請先確認你改的是新的 `HomePrayerCard` flow，還是舊的 legacy/request flow。

## 重要頁面

公開頁面：

```text
src/app/page.js
src/app/prayfor/page.js
src/app/prayfor/[id]/page.js
src/app/global-prayer-room/page.js
src/app/overcomer/page.js
src/app/overcomer/[slug]/page.js
```

會員頁面：

```text
src/app/customer-portal/page.js
src/app/customer-portal/create/page.js
src/app/customer-portal/edit/[id]/page.js
```

管理頁面：

```text
src/app/admin/*
```

共用外框：

```text
src/components/site-chrome.js
```

首頁與禱告牆共用卡片探索元件：

```text
src/components/HomePrayerExplorer.js
```

全球禱告室：

```text
src/components/GlobalPrayerRoom.js
```

## 修改原則

### 先照現有 flow 改

不要一開始就重寫大架構。這個專案已經有明確分區：

- public routes
- customer routes
- admin routes
- shared helpers
- Prisma model

先找現有 helper，能沿用就沿用。

### 權限檢查放 API 層

不要只靠前端隱藏按鈕。

會員 API 應該檢查：

- 是否登入
- 帳號是否可用
- 是否擁有該筆資料

管理 API 應該檢查：

- 是否為管理員
- 是否有對應權限

常用檔案：

```text
src/lib/server-session.js
src/lib/customer-access.js
src/lib/admin-session.js
src/lib/admin-route-auth.js
```

### 私密代禱要特別小心

`isPrivate` 的卡片不能在公開頁面洩漏：

- title
- description
- image
- owner
- detailsHref

全球禱告室可以顯示匿名大致位置光點，但不要公開細節。

### 圖片只接受站內來源

建立/更新卡片時，不要讓外部圖片 URL 任意進資料庫。

目前支援：

- `/uploads/...`
- `/api/card-thumbnail?...`

相關檔案：

```text
src/app/api/upload-image/route.js
src/app/api/card-thumbnail/route.js
src/lib/default-thumbnail.js
```

### 標籤與分類要一致

目前健康類別文字統一用：

```text
健康
```

不要再新增「醫治」作為同一組 UI 標籤。

### 文件要有人味

README 不要寫得像企業文件。

避免過度官方、過度像簡報標語的寫法。

Start Pray 的語氣應該是：

- 清楚
- 溫暖
- 真實
- 像有人正在長期維護

## 前端修改建議

### 手機版優先檢查

很多使用者會從手機開啟。改 UI 後請至少看：

- 首頁
- 禱告牆
- `/customer-portal/create`
- 全球禱告室
- footer / nav

### 不要做過度行銷式 landing page

這個專案的首頁可以溫暖，但不要變成空泛產品頁。使用者應該很快看懂：

- 可以看禱告
- 可以建立代禱卡
- 可以回應別人
- 可以進全球禱告室

### CSS

目前主要是 plain CSS：

```text
src/app/globals.css
src/styles/theme-modern.css
src/styles/theme-customer.css
src/styles/prayer-detail.css
```

修改時先找既有 class，不要隨意新增一套完全不同的命名系統。

## 後端修改建議

### API route 要保持邊界清楚

Public:

```text
src/app/api/home-cards/*
src/app/api/home-categories/*
src/app/api/responses/*
```

Customer:

```text
src/app/api/customer/*
```

Admin:

```text
src/app/api/admin/*
```

不要把 admin-only 行為塞進 public route。

### Prisma

改 schema 後要建立 migration，不要只改 `schema.prisma`。

常用指令：

```bash
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
```

## 測試與檢查

至少跑：

```bash
npm run lint
```

如果改到 build、server component、Prisma、或 API route，建議跑：

```bash
npm run build
```

如果改到資料庫：

```bash
npx prisma generate
npx prisma migrate status
```

## 常見陷阱

- 不要把私密卡片資料傳到公開頁面。
- 不要讓外部圖片 URL 當成新卡片封面。
- 不要只改前端驗證，API 也要一起檢查。
- 不要在 README 放太多技術細節，請放進 `docs/`。
- 不要重新引入舊專案名稱或過去已移除的金融資產敘事。
- 不要用新的大型 UI framework 重寫單一頁面。
- 不要假設所有分類都一定存在，前端要能處理空分類。

## 修改完成後的回報方式

回報時請簡短說明：

- 改了哪些檔案
- 使用者會看到什麼差異
- 跑了哪些檢查
- 有哪些既有 warning 或尚未處理的風險

這個專案不是只要功能能跑就好。請注意文字、隱私、手機體驗，以及使用者在脆弱時刻看到畫面的感受。
