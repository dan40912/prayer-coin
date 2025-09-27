import "./globals.css";
import "@/styles/admin.css";   // 專屬後台 CSS
import { Open_Sans, Raleway, Poppins } from "next/font/google";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300","400","500","600","700"], variable: "--font-poppins" });

export const metadata = {
  title: "禱告平台 Let's Pray | Prayer Coin",
  description: "讓我們一起禱告，讓我們聽見你的禱告，讓我們為你禱告，讓我們成為你的禱告夥伴。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant" className={`${openSans.variable} ${raleway.variable} ${poppins.variable}`}>
      <body className="admin-layout">{children}</body>
    </html>
  );
}
