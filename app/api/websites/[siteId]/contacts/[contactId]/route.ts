import { softDeleteContact } from "@/lib/db/contacts";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ siteId: string; contactId: string }> }
) {
  const { siteId, contactId } = await params;

  let found: boolean;
  try {
    found = await softDeleteContact(siteId, contactId);
  } catch {
    return Response.json({ error: "Invalid contact id" }, { status: 400 });
  }

  if (!found) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
