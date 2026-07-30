import { NextRequest, NextResponse } from "next/server";

const ICON_ID_PATTERN = /^[a-z0-9-]+:[a-z0-9-]+$/;

export async function GET(request: NextRequest) {
  const iconId = request.nextUrl.searchParams.get("icon")?.trim() ?? "";
  if (!ICON_ID_PATTERN.test(iconId)) {
    return NextResponse.json({ error: "图标标识无效" }, { status: 400 });
  }

  const [prefix, name] = iconId.split(":");
  try {
    const response = await fetch(
      `https://api.iconify.design/${prefix}/${name}.svg`,
      { next: { revalidate: 86_400 } },
    );
    if (!response.ok) {
      return NextResponse.json({ error: "图标不存在" }, { status: 404 });
    }

    const svg = await response.text();
    return new NextResponse(svg, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
        "Content-Type": "image/svg+xml; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "图标服务暂时不可用" },
      { status: 502 },
    );
  }
}
