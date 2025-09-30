"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SESSION_STORAGE_KEY = "prayer-coin-admin-session";

function readAdminSession() {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = readAdminSession();
    if (session?.role) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (twoFactor.trim() !== "123456") {
      setError("二階段驗證碼錯誤，請輸入 123456。");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "登入失敗，請確認帳號密碼");
      }

      const data = await response.json();

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ username: data.username, role: data.role })
        );
      }

      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-auth admin-auth--simple">
      <section className="admin-auth__panel">
        <div className="admin-auth__brand">
          <Image
            src="/legacy/img/logo.png"
            alt="Prayer Coin"
            width={56}
            height={56}
            className="admin-auth__logo"
          />
          <div>
            <p className="admin-auth__eyebrow">PRAY COIN</p>
            <h1 className="admin-auth__title">管理員登入</h1>
            <p className="admin-auth__subtitle">請輸入帳號、密碼與 2FA 驗證碼即可進入後台。</p>
          </div>
        </div>

        <form className="admin-auth__form" onSubmit={handleSubmit}>
          <div className="admin-auth__form-group">
            <label htmlFor="username">帳號</label>
            <input
              id="username"
              type="text"
              placeholder="輸入管理員帳號"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              disabled={submitting}
              required
            />
          </div>

          <div className="admin-auth__form-group">
            <label htmlFor="password">密碼</label>
            <input
              id="password"
              type="password"
              placeholder="輸入密碼"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={submitting}
              required
            />
          </div>

          <div className="admin-auth__form-group">
            <label htmlFor="twoFactor">
              二階段驗證碼
              <span className="admin-auth__hint"></span>
            </label>
            <input
              id="twoFactor"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="輸入 6 碼驗證碼"
              value={twoFactor}
              onChange={(event) => setTwoFactor(event.target.value)}
              disabled={submitting}
              required
            />
          </div>

          {error ? <p className="admin-auth__error">{error}</p> : null}

          <button type="submit" className="admin-auth__submit" disabled={submitting}>
            {submitting ? "登入中…" : "登入後台"}
          </button>
        </form>
      </section>
    </main>
  );
}
