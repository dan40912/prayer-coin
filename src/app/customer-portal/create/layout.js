import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "新增代禱事項",
  description: "登入後建立新的代禱事項。",
  path: "/customer-portal/create",
  noIndex: true,
});

export default function CustomerPortalCreateLayout({ children }) {
  return children;
}
