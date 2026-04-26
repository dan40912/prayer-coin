import { SITE_URL } from "@/lib/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/prayfor", "/overcomer", "/about", "/howto", "/whitepaper", "/disclaimer"],
        disallow: [
          "/admin",
          "/api",
          "/customer-portal",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/uploads",
          "/voices",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
