# Wallet Future Architecture (Draft)

Updated: 2026-03-22

## 1. 目標

目前系統只做點數記帳，不做鏈上發放。  
本設計的目標是讓你未來上線提款時，不需要大改核心資料表。

關鍵原則：

1. 點數與提款分離：先有內部帳本，再把提款做成「帳本 -> 提款申請 -> 鏈上交易」。
2. 多鏈多幣可擴充：不要把欄位綁死在 BSC 或單一幣種。
3. 帳務可稽核：用 immutable ledger（不可回寫歷史交易）。
4. 安全預留：地址驗證、風控、批次發送、idempotency 全部先有位子。

## 2. 現況（你目前已有）

現有可沿用欄位/表：

- `User.walletBalance`
- `User.bscAddress`
- `User.isAddressVerified`
- `TokenTransaction`（已有 type/status/amount/txHash/targetAddress）

建議：先保留相容，不要一次砍掉舊欄位。

## 3. 建議資料模型（Prisma 草案）

以下是「未來提款版」的結構草案，現在先設計，不急著 migration。

```prisma
enum ChainCode {
  ETH
  BSC
  POLYGON
  SOLANA
}

enum WalletAddressStatus {
  PENDING
  VERIFIED
  REVOKED
}

enum WithdrawalStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  QUEUED
  SUBMITTED
  CONFIRMED
  FAILED
  CANCELLED
}

enum LedgerEntryType {
  REWARD
  MANUAL_ADJUST
  WITHDRAW_LOCK
  WITHDRAW_RELEASE
  WITHDRAW_SETTLE
  FEE
}

enum LedgerAccountType {
  USER_AVAILABLE
  USER_LOCKED
  SYSTEM_TREASURY
  SYSTEM_FEE
}

model Asset {
  id               String   @id @default(cuid())
  symbol           String   // PRAY, USDT, ...
  chain            ChainCode
  contractAddress  String?  // native coin 可為 null
  decimals         Int
  minWithdrawal    Decimal  @db.Decimal(36,18)
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([symbol, chain, contractAddress])
}

model UserPayoutAddress {
  id               String              @id @default(cuid())
  userId           String
  chain            ChainCode
  address          String              // 顯示/送鏈上用
  addressHash      String              // 查重/索引
  label            String?
  isDefault        Boolean             @default(false)
  status           WalletAddressStatus @default(PENDING)
  verifiedAt       DateTime?
  revokedAt        DateTime?
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt

  user             User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, chain])
  @@unique([chain, addressHash])
}

model LedgerAccount {
  id               String            @id @default(cuid())
  userId           String?
  assetId          String
  type             LedgerAccountType
  isActive         Boolean           @default(true)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  user             User?             @relation(fields: [userId], references: [id], onDelete: Cascade)
  asset            Asset             @relation(fields: [assetId], references: [id])
  postings         LedgerPosting[]

  @@index([userId, assetId, type])
}

model LedgerEntry {
  id               String           @id @default(cuid())
  type             LedgerEntryType
  referenceType    String?          // WithdrawalRequest / TokenTransaction / AdminAction
  referenceId      String?
  idempotencyKey   String?          @unique
  metadata         Json?
  createdBy        String?          // adminId / system
  createdAt        DateTime         @default(now())

  postings         LedgerPosting[]
}

model LedgerPosting {
  id               String    @id @default(cuid())
  entryId          String
  accountId        String
  amount           Decimal   @db.Decimal(36,18) // 正數: 入帳, 負數: 出帳
  createdAt        DateTime  @default(now())

  entry            LedgerEntry    @relation(fields: [entryId], references: [id], onDelete: Cascade)
  account          LedgerAccount  @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([entryId])
  @@index([accountId, createdAt])
}

model WithdrawalRequest {
  id               String            @id @default(cuid())
  userId           String
  assetId          String
  payoutAddressId  String
  amount           Decimal           @db.Decimal(36,18)
  estimatedFee     Decimal?          @db.Decimal(36,18)
  netAmount        Decimal?          @db.Decimal(36,18)
  status           WithdrawalStatus  @default(PENDING_REVIEW)
  riskScore        Int?
  riskFlags        Json?
  reviewedBy       String?
  reviewedAt       DateTime?
  approvedAt       DateTime?
  submittedAt      DateTime?
  confirmedAt      DateTime?
  failedReason     String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  asset            Asset             @relation(fields: [assetId], references: [id])
  payoutAddress    UserPayoutAddress @relation(fields: [payoutAddressId], references: [id])
  chainTx          ChainTransaction?

  @@index([status, createdAt])
  @@index([userId, createdAt])
}

model ChainTransaction {
  id                 String    @id @default(cuid())
  withdrawalId       String    @unique
  chain              ChainCode
  txHash             String?   @unique
  nonce              String?
  explorerUrl        String?
  rawRequest         Json?
  rawReceipt         Json?
  confirmations      Int       @default(0)
  submittedAt        DateTime?
  confirmedAt        DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  withdrawal         WithdrawalRequest @relation(fields: [withdrawalId], references: [id], onDelete: Cascade)
}
```

## 4. 流程設計（先後順序）

### 4.1 內部記帳（現在就可先做）

1. 所有加減點數都寫 `LedgerEntry + LedgerPosting`。
2. `User.walletBalance` 先保留作為讀取快取欄位（可由 ledger 同步）。

### 4.2 提款申請（尚未串鏈也可先上）

1. 使用者送出 `WithdrawalRequest(PENDING_REVIEW)`。
2. 系統從 `USER_AVAILABLE` 轉帳到 `USER_LOCKED`（`WITHDRAW_LOCK`）。
3. Admin 審核 `APPROVED/REJECTED`。

### 4.3 串鏈後

1. 批次或單筆送出鏈上交易，建立 `ChainTransaction`。
2. `CONFIRMED` 後做 `WITHDRAW_SETTLE`（扣鎖定餘額）。
3. `FAILED` 時做 `WITHDRAW_RELEASE`（退回可用餘額）。

## 5. 後台能力對應（你想做的逐筆/大量）

逐筆：

1. 單筆審核提款（approve/reject）+ 理由
2. 單筆查看地址驗證與風險分數
3. 單筆交易重送、標記失敗、人工回滾

大量：

1. 批次審核（按條件勾選）-> 產生批次任務
2. 批次發送（未來串 provider）-> 批次 tx 追蹤
3. 批次回滾（只允許未上鏈成功項）

## 6. 資安與風控預留

1. 不把私鑰放在應用 DB。只存 provider key reference（例如 KMS/Vault path）。
2. 每次提款狀態變更都要寫 admin action log（含前後狀態、操作者、理由）。
3. 關鍵 API 加 idempotency key，避免重送重複扣款。
4. 地址只允許 whitelisted/verified 後提款。
5. 高額提款啟用 4-eyes 原則（兩位 admin）。

## 7. 相容遷移策略（避免一次重構）

Phase A（現在）：

1. 新增新表，不動舊流程。
2. 新獎勵流程改寫 ledger，同步更新 `User.walletBalance`。

Phase B（提款前）：

1. 啟用 `UserPayoutAddress` 與 `WithdrawalRequest` 後台審核。
2. Admin 僅做內部狀態流，不送鏈。

Phase C（上鏈）：

1. 接鏈上 provider，補 `ChainTransaction`。
2. 上線批次發送與回滾規則。

## 8. 與你現有欄位的建議

1. `User.bscAddress`：保留讀取相容，未來改由 `UserPayoutAddress` 管理。
2. `User.isAddressVerified`：保留相容，實際驗證狀態改看 `UserPayoutAddress.status`。
3. `TokenTransaction`：可逐步轉為「展示層事件」，實際資金真實來源改看 ledger。

