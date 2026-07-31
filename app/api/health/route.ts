import { NextResponse } from "next/server";
import packageMetadata from "@/package.json";

export function GET() {
  return NextResponse.json({
    name: "IconNest",
    status: "ok",
    version: packageMetadata.version,
  });
}
