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
    title: "IconNest — 把图标轻轻收进灵感花园",
    description:
      "一个清新、本地优先的图标管理工作台：搜索、收集、批量整理并交付你喜欢的图标。",
    applicationName: "IconNest",
    openGraph: {
      title: "IconNest — A softer home for every icon.",
      description:
        "A fresh, local-first workspace for collecting, organizing, and shipping icons.",
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
      title: "IconNest — A softer home for every icon.",
      description:
        "A fresh, local-first workspace for collecting, organizing, and shipping icons.",
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
