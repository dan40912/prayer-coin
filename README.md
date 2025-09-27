src/app/admin/
  ├─ dashboard/              → 總覽
  ├─ users/                  → 用戶管理
  ├─ prayer-requests/        → 禱告事項管理
  ├─ home-cards/             → 首頁卡片管理
  ├─ categories/             → 卡片分類管理
  ├─ content/                → 內容管理
  │   ├─ pages/              → 靜態頁面 (關於我們 / 使用教學 / 白皮書 / 免責聲明)
  │   │   ├─ page.js         → 列表 (所有靜態頁)
  │   │   └─ [id]/page.js    → 編輯單頁
  │   ├─ banners/            → Banner 管理
  │   │   ├─ page.js         → Banner 列表
  │   │   └─ [id]/page.js    → 編輯單一 Banner
  │   └─ site/               → 頁面顯示控制 (哪些區塊開啟/關閉)
  │       └─ page.js
  ├─ reports/                → 檢舉管理
  ├─ insights/               → 分析洞察
  └─ roles/                  → 權限管理