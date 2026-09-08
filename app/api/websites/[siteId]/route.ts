import { deleteWebsite, getWebsiteBySiteId } from "@/lib/db/websites";
import { deleteContactsBySiteId } from "@/lib/db/contacts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const website = await getWebsiteBySiteId(siteId);
  if (!website) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ website });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  await deleteWebsite(siteId);
  await deleteContactsBySiteId(siteId);
  return Response.json({ ok: true });
}
