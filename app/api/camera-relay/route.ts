import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* In-memory frame store — works locally; on Vercel instances may differ */
const rooms = new Map<string, { frame: string; ts: number }>();

export async function POST(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room") || "default";
  try {
    const { frame } = await req.json();
    if (!frame || typeof frame !== "string")
      return NextResponse.json({ ok: false, error: "no frame" }, { status: 400 });
    rooms.set(room, { frame, ts: Date.now() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room") || "default";
  const data = rooms.get(room);
  if (!data) return NextResponse.json({ frame: null, ts: 0 });
  return NextResponse.json(data);
}
