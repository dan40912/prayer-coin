import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "重設密碼",
  description: "設定新的 Start Pray 帳號密碼。",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordLayout({ children }) {
  return children;
}
