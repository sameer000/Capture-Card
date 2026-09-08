"use client";

import { useState } from "react";

export function CopySnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — user can still select and copy manually.
    }
  }

  return (
    <div className="space-y-2">
      <pre className="overflow-x-auto rounded border border-gray-200 bg-gray-900 p-4 text-xs text-gray-100">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
      >
        {copied ? "Copied!" : "Copy snippet"}
      </button>
    </div>
  );
}
