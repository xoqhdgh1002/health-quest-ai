import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "건강 퀘스트 AI",
  description: "게이미피케이션 기반 건강 관리 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
