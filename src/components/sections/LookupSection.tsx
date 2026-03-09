"use client";

import { useState, useCallback } from "react";
import { getParagraphContext } from "@/lib/api";
import type { Paragraph } from "@/lib/types";

interface ContextData {
  target: Paragraph;
  before: Paragraph[];
  after: Paragraph[];
}

function FormatGuide({ prominent }: { prominent?: boolean }) {
  return (
    <div
      className={`${prominent ? "rounded-lg border border-gray-200 bg-gray-50 p-5" : ""}`}
    >
      <p
        className={`mb-2 text-sm ${prominent ? "font-medium text-gray-700" : "text-gray-400"}`}
      >
        Supported reference formats:
      </p>
      <ul
        className={`space-y-1 text-sm ${prominent ? "text-gray-600" : "text-gray-400"}`}
      >
        <li>
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
            2:0.1
          </code>{" "}
          — Paper:Section.Paragraph (standard)
        </li>
        <li>
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
            2.0.1
          </code>{" "}
          — Paper.Section.Paragraph
        </li>
        <li>
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
            1:2.0.1
          </code>{" "}
          — Part:Paper.Section.Paragraph (global)
        </li>
      </ul>
    </div>
  );
}

function ParagraphBlock({
  paragraph,
  isTarget,
}: {
  paragraph: Paragraph;
  isTarget?: boolean;
}) {
  return (
    <div
      className={`px-5 py-4 ${
        isTarget
          ? "rounded-lg bg-blue-50 border border-blue-100"
          : "opacity-50"
      }`}
    >
      <span
        className={`inline-block mb-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isTarget
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {paragraph.standardReferenceId}
      </span>
      <p
        className={`leading-relaxed ${
          isTarget ? "text-base text-gray-900" : "text-sm text-gray-700"
        }`}
      >
        {paragraph.text}
      </p>
    </div>
  );
}

export function LookupSection() {
  const [ref, setRef] = useState("");
  const [contextWindow, setContextWindow] = useState(2);
  const [data, setData] = useState<ContextData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLookup = useCallback(async () => {
    const trimmed = ref.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await getParagraphContext(trimmed, contextWindow);
      setData(res.data);
    } catch {
      setError("Passage not found. Check your reference format.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [ref, contextWindow]);

  return (
    <div>
      {/* Input row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          placeholder="Enter a reference (e.g., 2:0.1)"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleLookup}
          disabled={loading || !ref.trim()}
          className="cursor-pointer rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Looking up…" : "Look Up"}
        </button>
      </div>

      {/* Context window slider */}
      <div className="mt-4 flex items-center gap-4">
        <label className="text-sm text-gray-600 whitespace-nowrap">
          Context:{" "}
          <span className="font-medium text-gray-900">{contextWindow}</span>{" "}
          {contextWindow === 1 ? "paragraph" : "paragraphs"} before &amp; after
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={contextWindow}
          onChange={(e) => setContextWindow(Number(e.target.value))}
          className="w-32 accent-primary"
        />
      </div>

      {/* Format guide — prominent when no lookup done, subtle after */}
      {!hasSearched && (
        <div className="mt-6">
          <FormatGuide prominent />
        </div>
      )}
      {hasSearched && !loading && (
        <div className="mt-3">
          <FormatGuide />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: contextWindow * 2 + 1 }).map((_, i) => {
            const isMiddle = i === contextWindow;
            return (
              <div
                key={i}
                className={`animate-pulse rounded-lg p-5 ${
                  isMiddle ? "bg-blue-50 border border-blue-100" : "border border-gray-100"
                }`}
              >
                <div className="mb-3 h-4 w-16 rounded bg-gray-200" />
                <div className="mb-2 h-3 w-full rounded bg-gray-100" />
                <div className="mb-2 h-3 w-5/6 rounded bg-gray-100" />
                <div className="h-3 w-2/3 rounded bg-gray-100" />
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results — continuous passage */}
      {!loading && !error && data && (
        <div className="mt-6 mx-auto max-w-3xl space-y-1">
          {data.before.map((p) => (
            <ParagraphBlock key={p.id} paragraph={p} />
          ))}
          <ParagraphBlock paragraph={data.target} isTarget />
          {data.after.map((p) => (
            <ParagraphBlock key={p.id} paragraph={p} />
          ))}
        </div>
      )}
    </div>
  );
}
