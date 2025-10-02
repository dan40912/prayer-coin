# 📌 HomePrayerCard API 說明文件

本文件說明了 `/api/home-cards` 相關 API 的使用方式、資料結構與權限規則。

---

## 1. 資料結構

`home_prayer_card` 資料表主要欄位：

- `id`: 主鍵，自動遞增
- `title`: 標題
- `description`: 描述
- `image`: 圖片 URL
- `alt`: 圖片描述
- `categoryId`: 分類 ID（對應 `home_prayer_category`）
- `ownerId`: 建立者 ID
- `isBlocked`: 是否被封鎖（違規或管理員隱藏）
- `tags`: 標籤（陣列）
- `meta`: 額外資訊（陣列）
- `detailsHref`: 詳細連結
- `voiceHref`: 音訊連結
- `createdAt` / `updatedAt`: 建立與更新時間

---

## 2. API 路由

### **(A) `GET /api/home-cards`**
取得祈禱卡列表。

#### Query 參數：
- `sort`：
  - `latest`（預設）→ 依建立時間排序
  - `responses` → 依回應數排序
- `limit`: 限制回傳筆數，預設 `6`
- `category`: 分類 slug，例如 `gospel`、`personal`

#### 權限行為：
- **User** → 只能看到 `isBlocked = false`
- **Owner** → 可以看到自己的卡，即使被封鎖
- **Admin** → 可以看到所有卡片

#### 範例回應：
```json
[
  {
    "id": 12,
    "title": "為世界和平禱告",
    "description": "求主賜下平安",
    "image": "/img/sample.jpg",
    "isBlocked": false,
    "category": { "id": 5, "name": "世界", "slug": "world" }
  }
]
(B) GET /api/home-cards/:id

取得單一卡片內容。

權限行為：

User → 只能看到 isBlocked = false

Owner → 可以看到自己的卡

Admin → 可以看到所有卡

(C) POST /api/home-cards

建立新祈禱卡。

Body 範例：
{
  "title": "為家人健康禱告",
  "description": "家人最近身體狀況需要代禱",
  "categoryId": 2,
  "image": "/img/family.jpg",
  "tags": ["家庭", "健康"],
  "meta": ["由小組提供"]
}

權限行為：

User 可建立（會綁定 ownerId 為自己）

Admin 可建立

(D) GET /api/home-cards/related?id=:id&limit=3

取得相關卡片（排除當前卡片）。

權限行為：

User → 只能看到 isBlocked = false

Owner → 可看到自己的卡

Admin → 全部都能看到

3. 權限規則
角色	能看到的卡片	CRUD 權限
User	只能看到 isBlocked = false	只能新增/編輯自己的卡
Owner	isBlocked = false + 自己的卡	可新增/編輯/刪除自己的卡
Admin	全部（包含 isBlocked = true）	可管理所有卡片