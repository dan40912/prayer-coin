# Remote Admin 2FA 安裝與部署教學

適用專案：`prayer-coin`  
情境前提：遠端 `.env` 已與地端一致，且已包含 `ADMIN_SESSION_SECRET`、`ADMIN_TOTP_SECRET`。

## 0) 先確認你現在用的是哪個環境

如果是正式機，建議不要沿用地端 2FA secret。  
你目前是「地端與遠端相同」，可以先上線驗證流程，但建議後續補做 secret 輪替。

## 1) SSH 進遠端主機

```bash
ssh <your-user>@<your-server>
```

進入專案目錄（依你目前 PM2 設定）：

```bash
cd /home/startpraynow/prayer-coin
```

## 2) 更新程式碼

```bash
git fetch origin
git checkout main
git pull origin main
```

確認目前版本：

```bash
git rev-parse --short HEAD
```

## 3) 檢查 Node / npm 環境

```bash
node -v
npm -v
```

建議 Node 22+。

## 4) 安裝依賴與建置

```bash
npm ci
npx prisma generate
npm run build
```

如果你有 migration 要套用，再補：

```bash
npx prisma migrate deploy
```

## 5) 檢查 2FA 必要環境變數

確認 `.env` 至少有：

```env
ADMIN_SESSION_SECRET=...
ADMIN_TOTP_SECRET=...
```

可用下面指令檢查「有沒有設到」：

```bash
grep -E '^(ADMIN_SESSION_SECRET|ADMIN_TOTP_SECRET)=' .env
```

正式環境不建議保留 fallback：

```env
# ADMIN_LOGIN_OTP=123456
```

## 6) 重啟服務（PM2）

```bash
pm2 startOrReload ecosystem.config.js --env production
pm2 save
pm2 status
```

看即時 log：

```bash
pm2 logs prayer-coin --lines 120
```

## 7) 驗證 2FA 是否已啟用

### 7.1 API 層驗證（不帶正確 OTP）

```bash
curl -i -X POST http://127.0.0.1:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"wrong","password":"wrong","otp":"000000"}'
```

預期：
- `401` 或 `400`：正常（代表驗證流程有啟動）
- `503`：異常（通常是 2FA 環境變數未配置成功）

### 7.2 後台防護驗證（未帶 session cookie）

```bash
curl -i -X PATCH http://127.0.0.1:3000/api/admin/users/test-id/block \
  -H "Content-Type: application/json" \
  -d '{"block":true}'
```

預期：
- `401 Unauthorized`

## 8) 如果你要把同一個 TOTP 帳號加到新手機

你可以用現有 `ADMIN_TOTP_SECRET` 重新產生 QR：

```bash
node - <<'NODE'
const { authenticator } = require("otplib");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const secret = (process.env.ADMIN_TOTP_SECRET || "").trim();
if (!secret) {
  console.error("ADMIN_TOTP_SECRET 未設定");
  process.exit(1);
}

const issuer = "Prayer Coin";
const account = "admin@prayer-coin.local";
const otpauth = authenticator.keyuri(account, issuer, secret);

const outDir = path.join(process.cwd(), "tmp");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "admin-2fa-qr.png");

QRCode.toFile(outFile, otpauth, { width: 320, margin: 2 }).then(() => {
  console.log(outFile);
});
NODE
```

產生後在遠端 `tmp/admin-2fa-qr.png`，下載到本機掃描即可。

## 9) 常見問題

1. `503 後台登入尚未完成 2FA 設定`
- `.env` 缺少 `ADMIN_TOTP_SECRET` 或應用沒有重啟。

2. OTP 一直錯
- 主機時間不同步（先做 NTP 校時）。
- authenticator 裡的帳號不是同一個 secret。

3. 重啟後仍舊舊版
- 先 `git rev-parse --short HEAD` 對照本地 commit。
- 確認 `pm2` 啟動目錄是 `/home/startpraynow/prayer-coin`（見 `ecosystem.config.js`）。

## 10) 上線後建議

1. 把 production 的 `ADMIN_TOTP_SECRET` 換成獨立值（不要和地端相同）。
2. 確認 `ADMIN_LOGIN_OTP` 沒有在正式機啟用。
3. 留存一份管理員 2FA 裝置註冊名單，避免單點失效。

