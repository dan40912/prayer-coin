"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus({ state: "error", message: "兩次密碼不一致" });
      return;
    }

    setStatus({ state: "loading", message: "" });

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "重設失敗");

      setStatus({ state: "success", message: data.message });
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  };

  return (
    <div className="auth-container">
      <h2>重設密碼</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="password">新密碼</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="至少 8 碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm">確認新密碼</label>
          <input
            type="password"
            id="confirm"
            className="form-control"
            placeholder="再次輸入新密碼"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        {status.message && (
          <div
            style={{
              marginTop: "0.5rem",
              color: status.state === "success" ? "green" : "red",
            }}
          >
            {status.message}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={status.state === "loading"}
          style={{ width: "100%", marginTop: "1rem" }}
        >
          {status.state === "loading" ? "更新中..." : "重設密碼"}
        </button>
      </form>
    </div>
  );
}
