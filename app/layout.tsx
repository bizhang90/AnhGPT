import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trình tạo ảnh bằng ChatGPT | Bee Creative Hub",
  description:
    "Trình tạo và chỉnh sửa hình ảnh bằng ChatGPT, hỗ trợ GPT-Image 2.5 Sunburst, Flare và tự nhập khóa API OpenAI trên giao diện.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
