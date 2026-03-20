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
      className={`${prominent ? "rounded-lg border border-gray-200 dark:border-gray-300/15 bg-gray-50 dark:bg-[#3b82f61a] p-5" : ""}`}
    >
      <p
        className={`mb-2 text-sm ${prominent ? "font-medium text-gray-700 dark:text-gray-400" : "text-gray-400 dark:text-gray-400"}`}
      >
        Supported reference formats:
      </p>
      <ul
        className={`space-y-1 text-sm ${prominent ? "text-gray-600 dark:text-gray-400" : "text-gray-400 dark:text-gray-400"}`}
      >
        <li>
          <code className="rounded bg-gray-100 dark:bg-[#3b82f61a] px-1.5 py-0.5 text-xs font-mono dark:text-[#3b82f6]">
            2:0.1
          </code>{" "}
          — Paper:Section.Paragraph (standard)
        </li>
        <li>
          <code className="rounded bg-gray-100 dark:bg-[#3b82f61a] px-1.5 py-0.5 text-xs font-mono dark:text-[#3b82f6]">
            2.0.1
          </code>{" "}
          — Paper.Section.Paragraph
        </li>
        <li>
          <code className="rounded bg-gray-100 dark:bg-[#3b82f61a] px-1.5 py-0.5 text-xs font-mono dark:text-[#3b82f6]">
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
          ? "rounded-lg bg-blue-50 dark:bg-[#3b82f61a] border border-blue-100 dark:border-[#3b82f6]/30"
          : "opacity-50"
      }`}
    >
      <span
        className={`inline-block mb-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isTarget
            ? "bg-primary text-white"
            : "bg-gray-100 dark:bg-[#3b82f61a] text-gray-500 dark:text-gray-400"
        }`}
      >
        {paragraph.standardReferenceId}
      </span>
      <p
        className={`leading-relaxed ${
          isTarget ? "text-base text-gray-900 dark:text-gray-300" : "text-sm text-gray-700 dark:text-gray-400"
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
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] px-4 py-3 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleLookup}
          disabled={loading || !ref.trim()}
          className="btn-primary-glow cursor-pointer rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Looking up\u2026" : "Look Up"}
        </button>
      </div>

      {/* Context window slider */}
      <div className="mt-4 flex items-center gap-4">
        <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
          Context:{" "}
          <span className="font-medium text-gray-900 dark:text-white">{contextWindow}</span>{" "}
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
                  isMiddle ? "bg-blue-50 dark:bg-[#3b82f61a] border border-blue-100 dark:border-[#3b82f6]/30" : "border border-gray-100 dark:border-gray-300/15"
                }`}
              >
                <div className="mb-3 h-4 w-16 rounded bg-gray-200 dark:bg-gray-300/10" />
                <div className="mb-2 h-3 w-full rounded bg-gray-100 dark:bg-gray-300/10" />
                <div className="mb-2 h-3 w-5/6 rounded bg-gray-100 dark:bg-gray-300/10" />
                <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-300/10" />
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
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
