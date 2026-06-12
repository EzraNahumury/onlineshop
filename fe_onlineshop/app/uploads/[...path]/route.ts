import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { uploadRoot } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

// Serves uploaded files from UPLOAD_DIR so they work even when UPLOAD_DIR points
// to a persistent folder outside the deploy directory. When UPLOAD_DIR is the
// default (public/uploads), Next serves those files statically and this route
// only handles the fallback.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await ctx.params;
  if (!segments || segments.length === 0 || segments.some((s) => s.includes(".."))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const root = path.resolve(uploadRoot());
  const filePath = path.resolve(path.join(root, ...segments));
  if (!filePath.startsWith(root + path.sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
