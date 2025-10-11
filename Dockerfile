# syntax=docker/dockerfile:1

# -------------------------------
# 🧱 基底階段 (Base)
# -------------------------------
FROM node:22-bullseye-slim AS base
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# -------------------------------
# 📦 安裝依賴 (Dependencies)
# -------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# -------------------------------
# 🏗️ 建置階段 (Builder)
# -------------------------------
FROM base AS builder
WORKDIR /app

# 複製依賴與原始碼
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma：產生 Client（根據 DATABASE_URL）
RUN npx prisma generate

# 建置 Next.js
RUN npm run build

# -------------------------------
# 🚀 執行階段 (Runner)
# -------------------------------
FROM node:22-bullseye-slim AS runner
WORKDIR /app

# 設定環境變數（Cloud Run 預設 PORT=3000）
ENV NODE_ENV=production
ENV PORT=3000

# 複製必要檔案
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# 開放 8080 port
EXPOSE 3000

# 啟動指令
CMD ["npm", "run", "start"]