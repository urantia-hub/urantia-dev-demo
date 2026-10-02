"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Paragraph } from "@urantia/api";

interface ContextData {
  target: Paragraph;
  before: Paragraph[];
  after: Paragraph[];
}

function FormatGuide({ prominent }: { prominent?: boolean }) {
  return (
    <div
      className={`${prominent ? "rounded-2xl border border-gray-200 bg-gray-50 p-5" : ""}`}
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
          Paper:Section.Paragraph (standard)
        </li>
        <li>
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
            2.0.1
          </code>{" "}
          Paper.Section.Paragraph
        </li>
        <li>
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
            1:2.0.1
          </code>{" "}
          Part:Paper.Section.Paragraph (global)
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
          ? "rounded-2xl bg-amber-wash/60 border border-[#f3e2bb]"
          : "opacity-80"
      }`}
    >
      <span
        className={`inline-block mb-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isTarget
            ? "bg-amber text-ink"
            : "bg-gray-100 text-gray-600"
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
      {isTarget && (
        <a
          href={`https://www.urantiahub.com/api/redirect/papers/by-standard-reference-id/${paragraph.standardReferenceId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Read on UrantiaHub ↗
        </a>
      )}
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
      const res = await api.paragraphs.context(trimmed, { window: contextWindow });
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
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleLookup}
          disabled={loading || !ref.trim()}
          className=" cursor-pointer rounded-lg btn-amber px-6 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Looking up\u2026" : "Look Up"}
        </button>
      </div>

      {/* Context window slider */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
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
                className={`animate-pulse rounded-2xl p-5 ${
                  isMiddle ? "bg-amber-wash/60 border border-[#f3e2bb]" : "border border-gray-100"
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
