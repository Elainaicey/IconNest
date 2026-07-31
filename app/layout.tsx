import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://iconnest.ushio.cc";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "IconNest",
    template: "%s · IconNest",
  },
  description:
    "本地优先的图标管理工作台：发现、收集、整理并交付常用图标。",
  applicationName: "IconNest",
  openGraph: {
    title: "IconNest · Icon workspace",
    description: "A local-first workspace for organizing and shipping icons.",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: "IconNest · Icon workspace",
    description: "A local-first workspace for organizing and shipping icons.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
