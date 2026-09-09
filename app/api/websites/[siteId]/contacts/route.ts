import { listContactsBySiteId, listDeletedContactsBySiteId } from "@/lib/db/contacts";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const showDeleted = new URL(request.url).searchParams.get("deleted") === "true";
  const contacts = showDeleted
    ? await listDeletedContactsBySiteId(siteId)
    : await listContactsBySiteId(siteId);
  return Response.json({ contacts });
}
