import Link from "next/link";
import { listWebsites } from "@/lib/db/websites";
import { CreateWebsiteForm } from "./create-website-form";
import { DeleteWebsiteButton } from "./delete-website-button";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const websites = await listWebsites();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-lg font-semibold text-gray-900">
          Your websites
        </h1>
        <CreateWebsiteForm />
      </section>

      <section className="space-y-2">
        {websites.length === 0 && (
          <p className="text-sm text-gray-500">
            No websites yet. Add one above to get its embed code.
          </p>
        )}
        {websites.map((website) => (
          <div
            key={website.siteId}
            className="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-3"
          >
            <Link
              href={`/admin/websites/${website.siteId}`}
              className="font-medium text-gray-900 hover:underline"
            >
              {website.name}
            </Link>
            <DeleteWebsiteButton siteId={website.siteId} />
          </div>
        ))}
      </section>
    </div>
  );
}
