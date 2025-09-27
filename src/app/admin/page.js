"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";
const STORAGE_KEY = "prayer-coin-admin-authenticated";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "true") {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const isValid = username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;

    if (!isValid) {
      setError("帳號或密碼錯誤，請再試一次 (admin / admin)。");
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, "true");
    setError("");
    router.push("/admin/dashboard");
  };

  return (
    <main className="admin-auth">
      <section className="admin-auth__panel">
        <h1>Admin 登入</h1>
        <form onSubmit={handleSubmit}>
          <label>帳號</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label>密碼</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit">登入</button>
        </form>
      </section>
    </main>
  );
}
