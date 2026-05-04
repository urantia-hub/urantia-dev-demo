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
  ot: "bg-amber-100 text-amber-700 dark:bg-[#3b82f61a] dark:text-[#3b82f6]",
  deuterocanon: "bg-purple-100 text-purple-700 dark:bg-[#3b82f61a] dark:text-[#3b82f6]",
  nt: "bg-blue-100 text-blue-700 dark:bg-[#3b82f61a] dark:text-[#3b82f6]",
};

function truncate(text: string, max = 280): string {
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

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
          placeholder="Ask the Bible — and see the matching Urantia paragraphs alongside…"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] px-4 py-3 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="btn-primary-glow cursor-pointer rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Canon toggle */}
      <div className="mt-3 flex gap-1 rounded-lg bg-gray-100 dark:bg-[#3b82f61a] p-1 self-start w-fit">
        {(["all", "ot", "deuterocanon", "nt"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCanon(c)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              canon === c
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                className="cursor-pointer rounded-full border border-gray-200 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 shadow-sm transition-colors hover:border-primary/40 hover:text-primary dark:hover:text-[#3b82f6]"
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
              className="animate-pulse rounded-lg border border-gray-100 dark:border-gray-300/15 p-5"
            >
              <div className="mb-3 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-300/10" />
              <div className="mb-2 h-3 w-full rounded bg-gray-100 dark:bg-gray-300/10" />
              <div className="mb-2 h-3 w-5/6 rounded bg-gray-100 dark:bg-gray-300/10" />
              <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-300/10" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((result) => {
            const isExpanded = expanded.has(result.id);
            return (
              <div
                key={result.id}
                className="card-glow rounded-lg border border-gray-200 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {result.reference}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${CANON_BADGE[result.canon]}`}
                  >
                    {CANON_LABELS[result.canon]}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 dark:text-gray-400">
                    Similarity: {(result.similarity * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-400">
                  {truncate(result.text)}
                </p>

                {result.urantiaParallels.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 dark:border-gray-300/10 pt-3">
                    <button
                      onClick={() => toggleExpanded(result.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? "▾" : "▸"}</span>
                      {result.urantiaParallels.length} related Urantia paragraph
                      {result.urantiaParallels.length === 1 ? "" : "s"}
                    </button>
                    {isExpanded && (
                      <div className="mt-3 space-y-3">
                        {result.urantiaParallels.map((p) => (
                          <div
                            key={p.id}
                            className="rounded-md border-l-2 border-primary/40 bg-gray-50 dark:bg-[#3b82f60d] py-2 pl-4 pr-2"
                          >
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                {p.standardReferenceId}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-400">
                                &middot;
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {p.paperTitle}
                              </span>
                              <span className="ml-auto text-xs text-gray-400 dark:text-gray-400">
                                {(p.similarity * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-400">
                              {truncate(p.text, 220)}
                            </p>
                            <a
                              href={`https://www.urantiahub.com/api/redirect/papers/by-standard-reference-id/${p.standardReferenceId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 inline-block text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              Read on UrantiaHub ↗
                            </a>
                          </div>
                        ))}
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
        <div className="mt-6 rounded-lg border border-gray-100 dark:border-gray-300/15 bg-gray-50 dark:bg-[#3b82f61a] py-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No results found. Try a different query or canon filter.
          </p>
        </div>
      )}
    </div>
  );
}
