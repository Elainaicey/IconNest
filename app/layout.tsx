import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
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

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#17161a" },
  ],
};

const themeBootScript = `
  try {
    var theme = localStorage.getItem("iconnest.theme") === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className={GeistSans.variable}>{children}</body>
    </html>
  );
}
