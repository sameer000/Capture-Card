import { getWebsiteBySiteId } from "@/lib/db/websites";
import { createContact } from "@/lib/db/contacts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const MAX_FIELDS = 50;
const MAX_VALUE_LENGTH = 5000;

function sanitizeData(input: unknown): Record<string, string> {
  const output: Record<string, string> = {};
  if (!input || typeof input !== "object") return output;

  const entries = Object.entries(input as Record<string, unknown>).slice(
    0,
    MAX_FIELDS
  );
  for (const [key, value] of entries) {
    if (typeof key !== "string") continue;
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value ?? "");
    output[key.slice(0, 200)] = stringValue.slice(0, MAX_VALUE_LENGTH);
  }
  return output;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.siteId !== "string") {
      return Response.json(
        { error: "Invalid request" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const website = await getWebsiteBySiteId(body.siteId);
    if (!website) {
      return Response.json(
        { error: "Unknown site" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    await createContact({
      siteId: body.siteId,
      data: sanitizeData(body.data),
      pageUrl:
        typeof body.pageUrl === "string" ? body.pageUrl.slice(0, 2000) : "",
      userAgent: request.headers.get("user-agent") ?? undefined,
      createdAt: new Date(),
    });

    return Response.json({ ok: true }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("collect error", error);
    return Response.json(
      { error: "Internal error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
