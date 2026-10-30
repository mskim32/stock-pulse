import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Pulse",
  description: "월별 상승률 Top 5와 나스닥 100 선물, 종목별 월간 수익률 히트맵",
  appleWebApp: { capable: true, title: "Stock Pulse", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#0B0E14",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">
        <main className="mx-auto min-h-dvh max-w-md pb-[env(safe-area-inset-bottom)]">{children}</main>
      </body>
    </html>
  );
}
