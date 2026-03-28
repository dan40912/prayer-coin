"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { WITHDRAW_MIN_AMOUNT } from "@/lib/withdrawals";

const STATUS_LABELS = {
  PENDING: "待審",
  PROCESSING_CHAIN: "鏈上處理",
  COMPLETED: "已完成",
  FAILED: "已取消",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("zh-TW");
  } catch {
    return String(value);
  }
}

function formatToken(amount) {
  return Number(amount ?? 0).toLocaleString("zh-TW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function CustomerWithdrawPanel({ profile, onProfileUpdate }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const [addressInput, setAddressInput] = useState(profile?.bscAddress ?? "");
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressFeedback, setAddressFeedback] = useState("");

  const walletBalance = Number(profile?.walletBalance ?? 0);
  const hasAddress = Boolean((profile?.bscAddress ?? "").trim());

  useEffect(() => {
    setAddressInput(profile?.bscAddress ?? "");
  }, [profile?.bscAddress]);

  const loadWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/customer/withdrawals?limit=20", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "無法載入提領紀錄");
      }

      setRecords(Array.isArray(payload.records) ? payload.records : []);
    } catch (caughtError) {
      setError(caughtError?.message || "無法載入提領紀錄");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWithdrawals();
  }, [loadWithdrawals]);

  const pendingCount = useMemo(
    () => records.filter((item) => item.status === "PENDING" || item.status === "PROCESSING_CHAIN").length,
    [records],
  );

  const handleSaveAddress = useCallback(async () => {
    try {
      setSavingAddress(true);
      setAddressFeedback("");
      const response = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bscAddress: addressInput.trim() }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "儲存地址失敗");
      }

      onProfileUpdate?.(payload);
      setAddressFeedback("地址已儲存。");
    } catch (caughtError) {
      setAddressFeedback(caughtError?.message || "儲存地址失敗");
    } finally {
      setSavingAddress(false);
    }
  }, [addressInput, onProfileUpdate]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < WITHDRAW_MIN_AMOUNT) {
      setFeedback(`提領金額至少 ${WITHDRAW_MIN_AMOUNT}。`);
      return;
    }

    try {
      setSubmitting(true);
      setFeedback("");

      const response = await fetch("/api/customer/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "送出提領申請失敗");
      }

      setAmount("");
      setFeedback("提領申請已送出，請等待管理員審核。");
      await loadWithdrawals();
    } catch (caughtError) {
      setFeedback(caughtError?.message || "送出提領申請失敗");
    } finally {
      setSubmitting(false);
    }
  }, [amount, loadWithdrawals]);

  return (
    <section className="cp-section cp-withdraw">
      <div className="cp-section__head">
        <div>
          <h2>代幣提領</h2>
          <p>
            最小提領金額：{WITHDRAW_MIN_AMOUNT}。目前採人工審核，送出後狀態會顯示在下方清單。
          </p>
        </div>
      </div>

      <div className="cp-withdraw__grid">
        <article className="cp-withdraw__card">
          <h3>BSC 地址</h3>
          <p className="cp-helper">請先設定提領地址，提領時會使用這個地址。</p>
          <div className="cp-withdraw__address-row">
            <input
              type="text"
              value={addressInput}
              onChange={(event) => setAddressInput(event.target.value)}
              placeholder="0x..."
              disabled={savingAddress}
            />
            <button
              type="button"
              className="cp-button cp-button--ghost"
              onClick={handleSaveAddress}
              disabled={savingAddress}
            >
              {savingAddress ? "儲存中..." : "儲存地址"}
            </button>
          </div>
          {addressFeedback ? <p className="cp-helper">{addressFeedback}</p> : null}
        </article>

        <article className="cp-withdraw__card">
          <h3>送出提領申請</h3>
          <p className="cp-helper">
            可用餘額：{formatToken(walletBalance)} 代幣。待審中：{pendingCount} 筆。
          </p>
          <form onSubmit={handleSubmit} className="cp-withdraw__form">
            <label>
              <span>提領金額</span>
              <input
                type="number"
                min={WITHDRAW_MIN_AMOUNT}
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={submitting || !hasAddress}
                required
              />
            </label>
            <button type="submit" className="cp-button" disabled={submitting || !hasAddress}>
              {submitting ? "送出中..." : "送出提領"}
            </button>
          </form>
          {!hasAddress ? <p className="cp-alert cp-alert--error">請先設定 BSC 地址。</p> : null}
          {feedback ? <p className="cp-helper">{feedback}</p> : null}
        </article>
      </div>

      <article className="cp-withdraw__card">
        <h3>最近提領紀錄</h3>
        {loading ? (
          <p className="cp-helper">載入中...</p>
        ) : error ? (
          <p className="cp-alert cp-alert--error">{error}</p>
        ) : records.length === 0 ? (
          <p className="cp-helper">目前尚無提領紀錄。</p>
        ) : (
          <div className="cp-withdraw__table-wrap">
            <table className="cp-withdraw__table">
              <thead>
                <tr>
                  <th>時間</th>
                  <th>金額</th>
                  <th>狀態</th>
                  <th>地址</th>
                  <th>TxHash</th>
                </tr>
              </thead>
              <tbody>
                {records.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>{formatToken(item.amount)}</td>
                    <td>{STATUS_LABELS[item.status] ?? item.status}</td>
                    <td>{item.targetAddress || "—"}</td>
                    <td>{item.txHash || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}
