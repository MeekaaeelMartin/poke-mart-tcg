import { NextRequest, NextResponse } from "next/server";
import { isAllowedMediaHost } from "@/lib/media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get("src");
  if (!src) {
    return NextResponse.json({ error: "src required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(target.protocol) || !isAllowedMediaHost(target.hostname)) {
    return NextResponse.json({ error: "host not allowed" }, { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
        "User-Agent": "PokeMartTCG/1.0 (+https://poke-mart-tcg)",
      },
      next: { revalidate: 86400 },
    });

    if (!upstream.ok) {
      return NextResponse.redirect(new URL("/images/card-placeholder.svg", req.url));
    }

    const contentType = upstream.headers.get("content-type") || "image/webp";
    // CDN sometimes returns HTML block pages — fall back to placeholder
    if (contentType.includes("text/html")) {
      return NextResponse.redirect(new URL("/images/card-placeholder.svg", req.url));
    }

    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/images/card-placeholder.svg", req.url));
  }
}
