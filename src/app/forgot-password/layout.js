import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "忘記密碼",
  description: "重設 Start Pray 帳號密碼。",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordLayout({ children }) {
  return children;
}
