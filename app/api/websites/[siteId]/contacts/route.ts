import { listContactsBySiteId } from "@/lib/db/contacts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const contacts = await listContactsBySiteId(siteId);
  return Response.json({ contacts });
}
