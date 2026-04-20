import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["vietnamese", "latin"],
  weight: ['300', '400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: "LinguaClay AI - Học ngôn ngữ nhẹ nhàng như chạm vào đất sét",
  description: "Nền tảng học Tiếng Anh & Tiếng Trung với AI. Flashcards thông minh, AI speaking partner, và dashboard gamification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${lexend.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-lexend">{children}</body>
    </html>
  );
}
