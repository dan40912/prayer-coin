"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const initialForm = {
  fullName: "",
  username: "",
  faithTradition: "",
  country: "",
  email: "",
  solanaAddress: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false
};

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    if (status.state === "success") {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status.state, router]);

  const updateField = (field) => (event) => {
    const value = field === "acceptedTerms" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ state: "loading", message: "" });

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "發生未知錯誤");
      }

      setStatus({ state: "success", message: "註冊成功！3 秒後將帶您前往登入頁面。" });
      setForm(initialForm);
    } catch (error) {
      setStatus({ state: "error", message: error.message });
    }
  };

  const isSubmitting = status.state === "loading";

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <span className="form-section-title">基本資料</span>
      <div className="form-grid columns-2">
        <div className="form-group">
          <label className="form-label" htmlFor="full-name">
            姓名 <span className="required-badge">必填</span>
          </label>
          <input
            className="form-control"
            type="text"
            id="full-name"
            placeholder="中文或英文姓名"
            value={form.fullName}
            onChange={updateField("fullName")}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="username">
            Username <span className="required-badge">必填</span>
          </label>
          <input
            className="form-control"
            type="text"
            id="username"
            placeholder="英數組合，至少 4 碼"
            value={form.username}
            onChange={updateField("username")}
            required
          />
          <span className="form-helper">將顯示於禱告牆與分享連結。</span>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="faith">
           您是否有信仰 ? <span className="required-badge">必填</span>
          </label>
          <select
            className="form-select"
            id="faith"
            value={form.faithTradition}
            onChange={updateField("faithTradition")}
            required
          >
            <option value="" disabled>
              請選擇
            </option>
            <option>基督徒</option>
            <option>佛教</option>
            <option>伊斯蘭教</option>
            <option>道教</option>
            <option>一貫道</option>
            <option>無信仰</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="country">
            居住區域 <span className="required-badge">必填</span>
          </label>
          <select
            className="form-select"
            id="country"
            value={form.country}
            onChange={updateField("country")}
            required
          >
            <option value="" disabled>
              請選擇
            </option>
            <option>台灣</option>
            <option>香港</option>
            <option>中國</option>
            <option>新加坡</option>
            <option>馬來西亞</option>
            <option>美國</option>
            <option>澳門</option>
            <option>印尼</option>
            <option>泰國</option>
            <option>越南</option>
            <option>菲律賓</option>
            <option>汶萊</option>
            <option>柬埔寨</option>
            <option>寮國</option>
            <option>緬甸</option>
            <option>加拿大</option>
            <option>紐西蘭</option>
            <option>英國</option>
            <option>法國</option>
            <option>加拿大</option>
            <option>南非</option>
            <option>巴西</option>
            <option>阿根廷</option>
            <option>其他</option>
          </select>
        </div>
      </div>

      <span className="form-section-title">帳戶與錢包</span>
      <div className="form-grid columns-2">
        <div className="form-group">
          <label className="form-label" htmlFor="signup-email">
            電子信箱 <span className="required-badge">必填</span>
          </label>
          <input
            className="form-control"
            type="email"
            id="signup-email"
            placeholder="you@example.com"
            value={form.email}
            onChange={updateField("email")}
            required
          />
        </div>
        <div className="form-group">
          {/* <label className="form-label" htmlFor="sol-address">
            Solana 收款地址 <span className="required-badge">必填</span>
          </label>
          <input
            className="form-control"
            type="text"
            id="sol-address"
            placeholder="例：6hF...pQ1"
            value={form.solanaAddress}
            onChange={updateField("solanaAddress")}
            required
          />
          <span className="form-helper">請確認地址正確，代幣獎勵將直接發送至此地址。</span> */}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="signup-password">
            設定密碼 <span className="required-badge">必填</span>
          </label>
          <input
            className="form-control"
            type="password"
            id="signup-password"
            placeholder="至少 8 碼，建議含符號"
            value={form.password}
            onChange={updateField("password")}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="signup-confirm">
            確認密碼 <span className="required-badge">必填</span>
          </label>
          <input
            className="form-control"
            type="password"
            id="signup-confirm"
            placeholder="再次輸入密碼"
            value={form.confirmPassword}
            onChange={updateField("confirmPassword")}
            required
          />
        </div>
      </div>

      <div className="form-group" style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
        <input
          type="checkbox"
          id="terms"
          checked={form.acceptedTerms}
          onChange={updateField("acceptedTerms")}
          required
          style={{ marginTop: "0.35rem", width: "18px", height: "18px" }}
        />
        <label
          htmlFor="terms"
          className="form-label"
          style={{ fontWeight: 400, fontSize: "0.88rem", color: "var(--text-secondary)" }}
        >
          我已詳閱並同意 <a href="/whitepaper" target="_blank" rel="noreferrer">免責聲、白皮書</a>
        </label>
      </div>

      {status.message && (
        <div
          role="alert"
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: "0.75rem",
            background: status.state === "success" ? "rgba(34,197,94,0.15)" : "rgba(248,113,113,0.15)",
            color: status.state === "success" ? "#166534" : "#991b1b"
          }}
        >
          {status.message}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center", opacity: isSubmitting ? 0.8 : 1 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "建立中…" : "建立帳戶"}
      </button>
    </form>
  );
}
