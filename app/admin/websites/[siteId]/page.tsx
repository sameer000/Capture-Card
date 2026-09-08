import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getWebsiteBySiteId } from "@/lib/db/websites";
import { listContactsBySiteId } from "@/lib/db/contacts";
import { CopySnippet } from "./copy-snippet";

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

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          Contacts ({contacts.length})
        </h2>
        {contacts.length === 0 ? (
          <p className="text-sm text-gray-500">
            No submissions captured yet.
          </p>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="rounded border border-gray-200 bg-white p-4"
              >
                <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(contact.createdAt).toLocaleString()}</span>
                  <a
                    href={contact.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline"
                  >
                    {contact.pageUrl}
                  </a>
                </div>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm">
                  {Object.entries(contact.data).map(([key, value]) => (
                    <div key={key} className="contents">
                      <dt className="font-medium text-gray-700">{key}</dt>
                      <dd className="text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
