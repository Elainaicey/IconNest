import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (host ? `${protocol}://${host}` : "https://iconnest.local");

  return {
    metadataBase: new URL(origin),
    title: "IconNest — 你的图标，都有归处",
    description:
      "收集、搜索、整理与交付图标的现代化本地图标管理工作台。",
    applicationName: "IconNest",
    openGraph: {
      title: "IconNest — Your icons. One beautiful home.",
      description:
        "A beautiful, local-first workspace for collecting and managing icons.",
      type: "website",
      locale: "zh_CN",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1731,
          height: 900,
          alt: "IconNest 图标管理工作台",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "IconNest — Your icons. One beautiful home.",
      description:
        "A beautiful, local-first workspace for collecting and managing icons.",
      images: [`${origin}/og.png`],
    },
  };
}

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
