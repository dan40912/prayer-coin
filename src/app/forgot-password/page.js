"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: "loading", message: "" });

    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "操作失敗");

      setStatus({ state: "success", message: data.message });
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  };

  return (
    <div className="auth-container">
      <h2>忘記密碼</h2>
      <p>輸入您註冊的 Email，我們將寄送重設連結。</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">電子信箱</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {status.state === "loading" ? "寄送中..." : "寄送重設連結"}
        </button>
      </form>
    </div>
  );
}
