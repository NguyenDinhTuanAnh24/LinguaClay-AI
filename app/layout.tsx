import type { Metadata } from "next";
import { Lexend, Playfair_Display, Inter, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["vietnamese", "latin"],
  weight: ['300', '400', '500', '600', '700', '800']
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["vietnamese", "latin"],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap'
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["vietnamese", "latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap'
});

// Be Vietnam Pro - optimized for Vietnamese diacritics
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-vietnamese",
  subsets: ["vietnamese", "latin"],
  weight: ['400','500','600','700','800'],
  display: 'swap'
});

import { Viewport } from "next";

export const metadata: Metadata = {
  title: "LinguaClay AI - Học tiếng Anh & Trung phong cách Brutalist",
  description: "Nền tảng học ngôn ngữ với AI. Flashcards thông minh, AI speaking partner, và dashboard gamification.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${lexend.variable} ${playfair.variable} ${inter.variable} ${beVietnamPro.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
