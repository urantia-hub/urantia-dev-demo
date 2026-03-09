"use client";

import { useState, useCallback } from "react";
import { searchParagraphs, semanticSearch } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

type SearchMode = "semantic" | "keyword";

const EXAMPLE_QUERIES = [
  "What happens after death?",
  "The nature of God",
  "Purpose of human suffering",
  "How does prayer work?",
];

function truncate(text: string, max = 300): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function ScoreBadge({ result, mode }: { result: SearchResult; mode: SearchMode }) {
  const value = mode === "semantic" ? result.similarity : result.rank;
  if (value == null) return null;

  const label = mode === "semantic" ? "Similarity" : "Rank";
  const display =
    mode === "semantic" && typeof value === "number"
      ? `${(value * 100).toFixed(1)}%`
      : `#${value}`;

  return (
    <span className="text-xs text-gray-400">
      {label}: {display}
    </span>
  );
}

export function SearchSection() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("semantic");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(
    async (q?: string) => {
      const searchQuery = (q ?? query).trim();
      if (!searchQuery) return;

      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const res =
          mode === "semantic"
            ? await semanticSearch(searchQuery, 5)
            : await searchParagraphs(searchQuery, "and", 5);

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
    // Need to pass the example directly since state won't update in time
    handleSearch(example);
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
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="cursor-pointer rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Mode toggle */}
      <div className="mt-3 flex gap-1 rounded-lg bg-gray-100 p-1 self-start w-fit">
        <button
          onClick={() => setMode("semantic")}
          className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "semantic"
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Semantic
        </button>
        <button
          onClick={() => setMode("keyword")}
          className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "keyword"
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
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
                className="cursor-pointer rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-600 shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
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
              className="animate-pulse rounded-lg border border-gray-100 p-5"
            >
              <div className="mb-3 h-4 w-1/4 rounded bg-gray-200" />
              <div className="mb-2 h-3 w-full rounded bg-gray-100" />
              <div className="mb-2 h-3 w-5/6 rounded bg-gray-100" />
              <div className="h-3 w-2/3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  Paper {result.paperId}
                </span>
                <span className="text-sm text-gray-400">·</span>
                <span className="text-sm text-gray-500">
                  {result.paperTitle}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {result.standardReferenceId}
                </span>
                <span className="ml-auto">
                  <ScoreBadge result={result} mode={mode} />
                </span>
              </div>
              <p className="text-sm leading-relaxed text-gray-700">
                {truncate(result.text)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && hasSearched && results.length === 0 && (
        <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 py-10 text-center">
          <p className="text-sm text-gray-500">
            No results found. Try rephrasing your query or switching search
            modes.
          </p>
        </div>
      )}
    </div>
  );
}
