"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteWebsiteButton({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this website and all its captured contacts?")) {
      return;
    }
    setPending(true);
    try {
      await fetch(`/api/websites/${siteId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
