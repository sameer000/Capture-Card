import { createWebsite, listWebsites } from "@/lib/db/websites";

export async function GET() {
  const websites = await listWebsites();
  return Response.json({ websites });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const website = await createWebsite(name);
  return Response.json({ website }, { status: 201 });
}
