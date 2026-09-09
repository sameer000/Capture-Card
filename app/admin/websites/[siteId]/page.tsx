import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getWebsiteBySiteId } from "@/lib/db/websites";
import { listContactsBySiteId } from "@/lib/db/contacts";
import { CopySnippet } from "./copy-snippet";
import { ContactsList, type SerializedContact } from "./contacts-list";

export const dynamic = "force-dynamic";

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export default async function WebsiteDetailPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const website = await getWebsiteBySiteId(siteId);
  if (!website) {
    notFound();
  }

  const [contacts, origin] = await Promise.all([
    listContactsBySiteId(siteId),
    getOrigin(),
  ]);

  const snippet = `<script src="${origin}/track.js" data-site-id="${siteId}" async></script>`;

  const serializedContacts: SerializedContact[] = contacts.map((contact) => ({
    id: String(contact._id),
    data: contact.data,
    pageUrl: contact.pageUrl,
    createdAt: contact.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          {website.name}
        </h1>
        <p className="text-sm text-gray-500">
          Paste this snippet into your website&apos;s HTML to start capturing
          form submissions.
        </p>
      </div>

      <CopySnippet code={snippet} />

      <ContactsList siteId={siteId} initialContacts={serializedContacts} />
    </div>
  );
}
