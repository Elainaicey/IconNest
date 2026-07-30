import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "IconNest",
    status: "ok",
    version: "0.2.0",
  });
}
