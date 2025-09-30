"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { saveAuthSession } from "@/lib/auth-storage";

const initialForm = {
  email: "",
  password: ""
};

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ state: "loading", message: "" });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "登入失敗，請稍後再試");
      }

      saveAuthSession(data.user);

      setStatus({ state: "success", message: "登入成功！即將帶您進入管理中心。" });
      setTimeout(() => {
        router.push("/customer-portal");
      }, 1200);
    } catch (error) {
      setStatus({ state: "error", message: error.message });
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="login-email">
          電子信箱 <span className="required-badge">必填</span>
        </label>
        <input
          className="form-control"
          type="email"
          id="login-email"
          placeholder="you@example.com"
          value={form.email}
          onChange={updateField("email")}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="login-password">
          密碼 <span className="required-badge">必填</span>
        </label>
        <input
          className="form-control"
          type="password"
          id="login-password"
          placeholder="至少 8 碼"
          value={form.password}
          onChange={updateField("password")}
          required
        />
        <span className="form-helper">若忘記密碼，可透過註冊 email 申請重設。</span>
        <p style={{ marginTop: "0.5rem", textAlign: "right" }}>
        <a href="/forgot-password" style={{ color: "#2563eb", fontSize: "0.9rem" }}>
          忘記密碼？
        </a>
      </p>
      </div>
      {status.message && (
        <div
          role="alert"
          style={{
            marginBottom: "1rem",
            padding: "0.9rem 1rem",
            borderRadius: "0.75rem",
            background: status.state === "success" ? "rgba(34,197,94,0.15)" : "rgba(248,113,113,0.15)",
            color: status.state === "success" ? "#166534" : "#991b1b"
          }}
        >
          {status.message}
        </div>
      )}
      <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={status.state === "loading"}>
        {status.state === "loading" ? "驗證中" : "登入祈禱管理中心"}
      </button>
    </form>
  );
}
