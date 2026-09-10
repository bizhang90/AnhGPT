import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AnhGPT Images | Bee Creative Hub",
  description:
    "Công cụ tạo và chỉnh sửa ảnh bằng GPT-Image, hỗ trợ tự nhập khóa API OpenAI trên giao diện.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
