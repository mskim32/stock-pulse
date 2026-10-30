import { NextResponse } from "next/server";

export const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });

/** Past months never change, so let the browser/CDN cache them longer. */
export function json(data: unknown, { immutable = false } = {}) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": immutable
        ? "public, max-age=3600, s-maxage=86400"
        : "public, max-age=60, s-maxage=300",
    },
  });
}
