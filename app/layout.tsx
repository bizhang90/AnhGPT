import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AnhGPT Images | Bee Creative Hub",
  description:
    "Beautiful Vercel-ready UI for GPT-Image generation with user-provided OpenAI API keys.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
