"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import type {
  BibleCanon,
  BibleSemanticSearchResult,
} from "@urantia/api";

const EXAMPLE_QUERIES = [
  "What does the Bible say about forgiveness?",
  "Love your enemies",
  "The Lord is my shepherd",
  "In the beginning God created",
];

const CANON_LABELS: Record<BibleCanon, string> = {
  ot: "Old Testament",
  deuterocanon: "Deuterocanon",
  nt: "New Testament",
};

const CANON_BADGE: Record<BibleCanon, string> = {
  ot: "bg-amber-wash text-amber-ink",
  deuterocanon: "bg-[#f3ece2] text-[#6b4f2a]",
  nt: "bg-[#e6f0ee] text-[#1f5a54]",
};

const TEXT_PREVIEW = 280;
const PARALLEL_PREVIEW = 220;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export function BibleSearchSection() {
  const [query, setQuery] = useState("");
  const [canon, setCanon] = useState<BibleCanon | "all">("all");
  const [results, setResults] = useState<BibleSemanticSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  // Composite expansion keys: `${id}:text`, `${id}:list`, `up:${id}:${pid}:text`.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const handleSearch = useCallback(
    async (q?: string) => {
      const searchQuery = (q ?? query).trim();
      if (!searchQuery) return;

      setLoading(true);
      setError(null);
      setHasSearched(true);
      setExpanded(new Set());

      try {
        const res = await api.bible.semanticSearch({
          q: searchQuery,
          limit: 5,
          urantiaParallelLimit: 3,
          canon: canon === "all" ? undefined : canon,
        });
        setResults(res.data ?? []);
      } catch {
        setError("Something went wrong. Please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [query, canon],
  );

  const handleExampleClick = (example: string) => {
    setQuery(example);
    handleSearch(example);
  };

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const showExamples = !query.trim() && !hasSearched && !loading;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Ask the Bible, and see the matching Urantia paragraphs alongside…"
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className=" cursor-pointer rounded-lg btn-amber px-6 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Canon toggle */}
      <div className="mt-3 flex gap-1 rounded-lg bg-gray-100 p-1 self-start w-fit">
        {(["all", "ot", "deuterocanon", "nt"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCanon(c)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              canon === c
                ? "btn-amber"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {c === "all" ? "All books" : CANON_LABELS[c]}
          </button>
        ))}
      </div>

      {showExamples && (
        <div className="mt-6">
          <p className="mb-2 text-sm text-gray-400">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                className="cursor-pointer rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-600 transition-colors hover:border-primary/40 hover:text-primary"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-100 p-5"
            >
              <div className="mb-3 h-4 w-1/4 rounded bg-gray-200" />
              <div className="mb-2 h-3 w-full rounded bg-gray-100" />
              <div className="mb-2 h-3 w-5/6 rounded bg-gray-100" />
              <div className="h-3 w-2/3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((result) => {
            const textKey = `${result.id}:text`;
            const listKey = `${result.id}:list`;
            const isTextExpanded = expanded.has(textKey);
            const isListExpanded = expanded.has(listKey);
            const textIsLong = result.text.length > TEXT_PREVIEW;
            return (
              <div
                key={result.id}
                className=" rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {result.reference}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${CANON_BADGE[result.canon]}`}
                  >
                    {CANON_LABELS[result.canon]}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    Similarity: {(result.similarity * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-700">
                  {isTextExpanded ? result.text : truncate(result.text, TEXT_PREVIEW)}
                </p>
                {textIsLong && (
                  <button
                    onClick={() => toggleExpanded(textKey)}
                    className="mt-2 cursor-pointer text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {isTextExpanded ? "Read less" : "Read more"}
                  </button>
                )}

                {result.urantiaParallels.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <button
                      onClick={() => toggleExpanded(listKey)}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      <span>{isListExpanded ? "▾" : "▸"}</span>
                      {result.urantiaParallels.length} related Urantia paragraph
                      {result.urantiaParallels.length === 1 ? "" : "s"}
                    </button>
                    {isListExpanded && (
                      <div className="mt-3 space-y-3">
                        {result.urantiaParallels.map((p) => {
                          const pTextKey = `up:${result.id}:${p.id}:text`;
                          const pTextExpanded = expanded.has(pTextKey);
                          const pTextIsLong = p.text.length > PARALLEL_PREVIEW;
                          return (
                            <div
                              key={p.id}
                              className="rounded-md border-l-2 border-primary/40 bg-gray-50 py-2 pl-4 pr-2"
                            >
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-gray-900">
                                  {p.standardReferenceId}
                                </span>
                                <span className="text-xs text-gray-400">
                                  &middot;
                                </span>
                                <span className="text-xs text-gray-500">
                                  {p.paperTitle}
                                </span>
                                <span className="ml-auto text-xs text-gray-400">
                                  {(p.similarity * 100).toFixed(0)}%
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed text-gray-700">
                                {pTextExpanded ? p.text : truncate(p.text, PARALLEL_PREVIEW)}
                              </p>
                              {pTextIsLong && (
                                <button
                                  onClick={() => toggleExpanded(pTextKey)}
                                  className="mt-1.5 cursor-pointer text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                  {pTextExpanded ? "Read less" : "Read more"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && hasSearched && results.length === 0 && (
        <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 py-10 text-center">
          <p className="text-sm text-gray-500">
            No results found. Try a different query or canon filter.
          </p>
        </div>
      )}
    </div>
  );
}
