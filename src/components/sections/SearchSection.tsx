"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import type { EntityType, Paragraph, TopEntity } from "@urantia/api";

type SearchMode = "semantic" | "keyword";

type SearchResultItem = Paragraph & { rank?: number; similarity?: number };

// Colors match the EntitySection entity-type palette so chips read consistently.
const TYPE_COLORS: Record<EntityType, string> = {
  being: "bg-blue-100 text-blue-700 dark:bg-[#3b82f61a] dark:text-[#3b82f6]",
  place: "bg-green-100 text-green-700 dark:bg-[#3b82f61a] dark:text-[#3b82f6]",
  order: "bg-purple-100 text-purple-700 dark:bg-[#3b82f61a] dark:text-[#3b82f6]",
  race: "bg-amber-100 text-amber-700 dark:bg-[#3b82f61a] dark:text-[#3b82f6]",
  religion: "bg-rose-100 text-rose-700 dark:bg-[#3b82f61a] dark:text-[#3b82f6]",
  concept: "bg-slate-100 text-slate-700 dark:bg-[#3b82f61a] dark:text-[#3b82f6]",
};

const CHIPS_PER_RESULT = 4;
const TEXT_PREVIEW = 300;
const PARALLEL_PREVIEW = 220;

const EXAMPLE_QUERIES = [
  "What happens after death?",
  "The nature of God",
  "Purpose of human suffering",
  "How does prayer work?",
];

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function ScoreBadge({ result, mode }: { result: SearchResultItem; mode: SearchMode }) {
  const value = mode === "semantic" ? result.similarity : result.rank;
  if (value == null) return null;

  const label = mode === "semantic" ? "Similarity" : "Rank";
  const display =
    mode === "semantic" && typeof value === "number"
      ? `${(value * 100).toFixed(1)}%`
      : `#${value}`;

  return (
    <span className="text-xs text-gray-400 dark:text-gray-400">
      {label}: {display}
    </span>
  );
}

export function SearchSection() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("semantic");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  // Paper ID -> topEntities aggregate, filled from a single list call on mount.
  const [paperTopEntities, setPaperTopEntities] = useState<
    Record<string, TopEntity[]>
  >({});
  // Composite expansion keys: `${id}:text`, `${id}:bible`, `${id}:urantia`,
  // and per-parallel `bp:${parentId}:${chunkId}:text`, `up:${parentId}:${pid}:text`.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.papers.list({ include: "topEntities" });
        if (cancelled) return;
        const map: Record<string, TopEntity[]> = {};
        for (const paper of res.data) {
          if (paper.topEntities) map[paper.id] = paper.topEntities;
        }
        setPaperTopEntities(map);
      } catch {
        // Silent fail — chips are a nice-to-have, not essential.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = useCallback(
    async (q?: string) => {
      const searchQuery = (q ?? query).trim();
      if (!searchQuery) return;

      setLoading(true);
      setError(null);
      setHasSearched(true);
      setExpanded(new Set());

      try {
        const res =
          mode === "semantic"
            ? await api.search.semantic({
                q: searchQuery,
                limit: 5,
                include: "bibleParallels,urantiaParallels",
              })
            : await api.search.fullText({
                q: searchQuery,
                type: "and",
                limit: 5,
                include: "bibleParallels,urantiaParallels",
              });

        setResults(res.data ?? []);
      } catch {
        setError("Something went wrong. Please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [query, mode],
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
      {/* Search input row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Ask a question about the Urantia Papers..."
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

      {/* Mode toggle */}
      <div className="mt-3 flex gap-1 rounded-lg bg-gray-100 dark:bg-[#3b82f61a] p-1 self-start w-fit">
        <button
          onClick={() => setMode("semantic")}
          className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "semantic"
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Semantic
        </button>
        <button
          onClick={() => setMode("keyword")}
          className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "keyword"
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Keyword
        </button>
      </div>

      {/* Example queries */}
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

      {/* Loading skeleton */}
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

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((result) => {
            const textKey = `${result.id}:text`;
            const bibleKey = `${result.id}:bible`;
            const urantiaKey = `${result.id}:urantia`;
            const isTextExpanded = expanded.has(textKey);
            const isBibleExpanded = expanded.has(bibleKey);
            const isUrantiaExpanded = expanded.has(urantiaKey);
            const textIsLong = result.text.length > TEXT_PREVIEW;
            const bibleParallels = result.bibleParallels ?? [];
            const urantiaParallels = result.urantiaParallels ?? [];

            return (
              <div
                key={result.id}
                className="card-glow rounded-lg border border-gray-200 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Paper {result.paperId}
                  </span>
                  <span className="text-sm text-gray-400 dark:text-gray-400">&middot;</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {result.paperTitle}
                  </span>
                  <span className="rounded-full bg-gray-100 dark:bg-[#3b82f61a] px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-[#3b82f6]">
                    {result.standardReferenceId}
                  </span>
                  <span className="ml-auto">
                    <ScoreBadge result={result} mode={mode} />
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-400">
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
                {paperTopEntities[result.paperId]?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {paperTopEntities[result.paperId]
                      ?.slice(0, CHIPS_PER_RESULT)
                      .map((e) => (
                        <span
                          key={e.id}
                          title={`Cited ${e.count}x in this paper`}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[e.type as EntityType] ?? ""}`}
                        >
                          {e.name}
                        </span>
                      ))}
                  </div>
                ) : null}

                {bibleParallels.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 dark:border-gray-300/10 pt-3">
                    <button
                      onClick={() => toggleExpanded(bibleKey)}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      <span>{isBibleExpanded ? "▾" : "▸"}</span>
                      {bibleParallels.length} related Bible passage
                      {bibleParallels.length === 1 ? "" : "s"}
                    </button>
                    {isBibleExpanded && (
                      <div className="mt-3 space-y-3">
                        {bibleParallels.map((p) => {
                          const pTextKey = `bp:${result.id}:${p.chunkId}:text`;
                          const pTextExpanded = expanded.has(pTextKey);
                          const pTextIsLong = p.text.length > PARALLEL_PREVIEW;
                          return (
                            <div
                              key={p.chunkId}
                              className="rounded-md border-l-2 border-primary/40 bg-gray-50 dark:bg-[#3b82f60d] py-2 pl-4 pr-2"
                            >
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                  {p.reference}
                                </span>
                                <span className="ml-auto text-xs text-gray-400 dark:text-gray-400">
                                  {(p.similarity * 100).toFixed(0)}%
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-400">
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

                {urantiaParallels.length > 0 && (
                  <div className="mt-3 border-t border-gray-100 dark:border-gray-300/10 pt-3">
                    <button
                      onClick={() => toggleExpanded(urantiaKey)}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      <span>{isUrantiaExpanded ? "▾" : "▸"}</span>
                      {urantiaParallels.length} related Urantia paragraph
                      {urantiaParallels.length === 1 ? "" : "s"}
                    </button>
                    {isUrantiaExpanded && (
                      <div className="mt-3 space-y-3">
                        {urantiaParallels.map((p) => {
                          const pTextKey = `up:${result.id}:${p.id}:text`;
                          const pTextExpanded = expanded.has(pTextKey);
                          const pTextIsLong = p.text.length > PARALLEL_PREVIEW;
                          return (
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

      {/* Empty state */}
      {!loading && !error && hasSearched && results.length === 0 && (
        <div className="mt-6 rounded-lg border border-gray-100 dark:border-gray-300/15 bg-gray-50 dark:bg-[#3b82f61a] py-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No results found. Try rephrasing your query or switching search
            modes.
          </p>
        </div>
      )}
    </div>
  );
}
