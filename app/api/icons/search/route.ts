import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_PREFIXES = ["lucide", "tabler", "ph", "ri", "solar"];
const ALLOWED_PREFIXES = new Set(SUPPORTED_PREFIXES);

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const prefix = request.nextUrl.searchParams.get("prefix")?.trim() ?? "";
  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 96);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.floor(requestedLimit), 1), 96)
    : 96;

  if (query.length < 2 || query.length > 80) {
    return NextResponse.json(
      { error: "搜索词长度需在 2 到 80 个字符之间" },
      { status: 400 },
    );
  }
  if (prefix && !ALLOWED_PREFIXES.has(prefix)) {
    return NextResponse.json({ error: "不支持该图标来源" }, { status: 400 });
  }

  const params = new URLSearchParams({
    query,
    limit: String(limit),
  });
  params.set("prefixes", prefix || SUPPORTED_PREFIXES.join(","));

  try {
    const response = await fetch(
      `https://api.iconify.design/search?${params.toString()}`,
      { next: { revalidate: 300 } },
    );
    if (!response.ok) throw new Error(`Iconify returned ${response.status}`);

    const payload = (await response.json()) as {
      icons?: unknown;
      total?: unknown;
      limit?: unknown;
      start?: unknown;
    };
    const icons = Array.isArray(payload.icons)
      ? payload.icons.filter((icon): icon is string => typeof icon === "string")
      : [];

    return NextResponse.json(
      {
        icons,
        total: typeof payload.total === "number" ? payload.total : icons.length,
        limit: typeof payload.limit === "number" ? payload.limit : limit,
        start: typeof payload.start === "number" ? payload.start : 0,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Iconify 搜索服务暂时不可用" },
      { status: 502 },
    );
  }
}
