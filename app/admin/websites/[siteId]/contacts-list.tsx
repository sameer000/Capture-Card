"use client";

import { useState } from "react";

export interface SerializedContact {
  id: string;
  data: Record<string, string>;
  pageUrl: string;
  createdAt: string;
  deletedAt?: string;
}

function summarize(data: Record<string, string>): string {
  const entries = Object.entries(data);
  const nameEntry = entries.find(([key]) => /name/i.test(key));
  if (nameEntry && nameEntry[1]) return nameEntry[1];
  const emailEntry = entries.find(([key]) => /email/i.test(key));
  if (emailEntry && emailEntry[1]) return emailEntry[1];
  const firstNonEmpty = entries.find(([, value]) => value);
  return firstNonEmpty ? firstNonEmpty[1] : "Untitled contact";
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ContactRow({
  contact,
  showDelete,
  onDelete,
}: {
  contact: SerializedContact;
  showDelete: boolean;
  onDelete?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm("Delete this contact?")) return;
    setDeleting(true);
    try {
      onDelete(contact.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-500">
          <EyeIcon />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
          {summarize(contact.data)}
        </span>
        <span className="shrink-0 text-xs text-gray-500">
          {new Date(contact.createdAt).toLocaleString()}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm">
            {Object.entries(contact.data).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="font-medium text-gray-700">{key}</dt>
                <dd className="text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
          <a
            href={contact.pageUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block truncate text-xs text-gray-500 hover:underline"
          >
            {contact.pageUrl}
          </a>
          {contact.deletedAt && (
            <p className="mt-2 text-xs text-gray-500">
              Deleted {new Date(contact.deletedAt).toLocaleString()}
            </p>
          )}
          {showDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="mt-3 rounded border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ContactsList({
  siteId,
  initialContacts,
}: {
  siteId: string;
  initialContacts: SerializedContact[];
}) {
  const [tab, setTab] = useState<"active" | "deleted">("active");
  const [contacts, setContacts] = useState(initialContacts);
  const [deletedContacts, setDeletedContacts] = useState<
    SerializedContact[] | null
  >(null);
  const [loadingDeleted, setLoadingDeleted] = useState(false);

  async function showDeletedTab() {
    setTab("deleted");
    if (deletedContacts !== null) return;
    setLoadingDeleted(true);
    try {
      const res = await fetch(
        `/api/websites/${siteId}/contacts?deleted=true`
      );
      const body = await res.json();
      setDeletedContacts(
        (body.contacts ?? []).map(
          (c: { _id: string; data: Record<string, string>; pageUrl: string; createdAt: string; deletedAt?: string }) => ({
            id: c._id,
            data: c.data,
            pageUrl: c.pageUrl,
            createdAt: c.createdAt,
            deletedAt: c.deletedAt,
          })
        )
      );
    } finally {
      setLoadingDeleted(false);
    }
  }

  async function handleDelete(contactId: string) {
    const removed = contacts.find((c) => c.id === contactId);
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    if (removed) {
      setDeletedContacts((prev) =>
        prev ? [{ ...removed, deletedAt: new Date().toISOString() }, ...prev] : prev
      );
    }
    await fetch(`/api/websites/${siteId}/contacts/${contactId}`, {
      method: "DELETE",
    });
  }

  const list = tab === "active" ? contacts : deletedContacts ?? [];

  return (
    <section>
      <div className="mb-3 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={
            "text-sm font-semibold " +
            (tab === "active"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600")
          }
        >
          Contacts ({contacts.length})
        </button>
        <button
          type="button"
          onClick={showDeletedTab}
          className={
            "text-sm font-semibold " +
            (tab === "deleted"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600")
          }
        >
          Deleted
        </button>
      </div>

      {tab === "deleted" && loadingDeleted ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500">
          {tab === "active"
            ? "No submissions captured yet."
            : "No deleted contacts."}
        </p>
      ) : (
        <div className="space-y-2">
          {list.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              showDelete={tab === "active"}
              onDelete={tab === "active" ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
