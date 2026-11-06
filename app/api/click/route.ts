import { NextResponse } from "next/server";

import { PLACES } from "@/data/tunisiaData";
import { CLICK_KINDS, CLICK_PAGES } from "@/lib/clicks";
import { allow, clientIp, sameOrigin } from "@/lib/requestGuard";
import { callFunction, supabaseConfig } from "@/lib/supabase";

/**
 * Adds one to the daily count of clicks on an outside link (db/link-clicks.sql). Nothing identifying is stored:
 * the address is only used, in memory, to stop one browser from flooding the counters.
 */
export const runtime = "nodejs";

const PLACE_IDS = new Set(PLACES.map((p) => p.id));

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return new NextResponse(null, { status: 204 });
  if (!sameOrigin(request))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!allow(`click:${clientIp(request)}`, 120, 60 * 60 * 1000))
    return new NextResponse(null, { status: 204 });

  const body = (await request.json().catch(() => null)) as {
    kind?: unknown;
    page?: unknown;
    place?: unknown;
  } | null;
  const kind = String(body?.kind ?? "");
  const page = String(body?.page ?? "");
  const place =
    typeof body?.place === "string" && PLACE_IDS.has(body.place)
      ? body.place
      : "";
  if (
    !(CLICK_KINDS as readonly string[]).includes(kind) ||
    !(CLICK_PAGES as readonly string[]).includes(page)
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  try {
    await callFunction(cfg, "count_link_click", {
      p_kind: kind,
      p_page: page,
      p_place: place,
    });
  } catch (error) {
    // The table may not exist yet: counting stays silent for the visitor.
    console.error("click count failed", error);
  }
  return new NextResponse(null, { status: 204 });
}
