"use client";

import { useState, useCallback } from "react";
import { semanticSearch } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

const EXAMPLE_TOPICS = [
  "How does prayer work?",
  "What happens after death?",
  "The nature of God",
  "Meaning of faith",
];

interface PlanDay {
  dayNumber: number;
  title: string;
  paragraphs: SearchResult[];
}

function truncate(text: string, max = 200): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "\u2026";
}

/** Group semantic search results into days by Paper, preserving similarity order within each group. */
function buildPlan(results: SearchResult[], durationDays: number): PlanDay[] {
  // Group paragraphs by paperId, preserving similarity order
  const paperGroups = new Map<string, SearchResult[]>();
  for (const r of results) {
    const group = paperGroups.get(r.paperId) ?? [];
    group.push(r);
    paperGroups.set(r.paperId, group);
  }

  // Sort groups by their best (first) paragraph's similarity
  const sortedGroups = [...paperGroups.entries()].sort((a, b) => {
    const simA = a[1][0]?.similarity ?? 0;
    const simB = b[1][0]?.similarity ?? 0;
    return simB - simA;
  });

  // Distribute groups across days round-robin style
  const days: PlanDay[] = Array.from({ length: durationDays }, (_, i) => ({
    dayNumber: i + 1,
    title: "",
    paragraphs: [],
  }));

  sortedGroups.forEach(([ , paragraphs], idx) => {
    const dayIdx = idx % durationDays;
    days[dayIdx].paragraphs.push(...paragraphs);
  });

  // Remove empty days and generate titles from the dominant paper
  return days
    .filter((d) => d.paragraphs.length > 0)
    .map((day, idx) => {
      // Find the most common paper title for this day
      const titleCounts = new Map<string, number>();
      for (const p of day.paragraphs) {
        titleCounts.set(p.paperTitle, (titleCounts.get(p.paperTitle) ?? 0) + 1);
      }
      const dominantTitle = [...titleCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Readings";

      return {
        ...day,
        dayNumber: idx + 1,
        title: dominantTitle,
      };
    });
}

export function ReadingPlanSection() {
  const [topic, setTopic] = useState("");
  const [days, setDays] = useState(3);
  const [plan, setPlan] = useState<PlanDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [activeTopic, setActiveTopic] = useState("");

  const handleGenerate = useCallback(
    async (t?: string) => {
      const searchTopic = (t ?? topic).trim();
      if (!searchTopic) return;

      setLoading(true);
      setError(null);
      setHasGenerated(true);
      setExpandedDay(null);
      setActiveTopic(searchTopic);

      try {
        // Fetch more results than a normal search to have enough for multiple days
        const res = await semanticSearch(searchTopic, 20);
        const results = res.data ?? [];

        if (results.length < 3) {
          setError("Not enough results found for this topic. Try a broader query.");
          setPlan([]);
          return;
        }

        const generated = buildPlan(results, days);
        setPlan(generated);
        setExpandedDay(1);
      } catch {
        setError("Something went wrong. Please try again.");
        setPlan([]);
      } finally {
        setLoading(false);
      }
    },
    [topic, days],
  );

  const handleExampleClick = (example: string) => {
    setTopic(example);
    handleGenerate(example);
  };

  const showExamples = !topic.trim() && !hasGenerated && !loading;
  const totalParagraphs = plan.reduce((sum, d) => sum + d.paragraphs.length, 0);

  return (
    <div>
      {/* Input row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="Enter a topic, e.g. &quot;prayer&quot; or &quot;life after death&quot;..."
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] px-4 py-3 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => handleGenerate()}
          disabled={loading || !topic.trim()}
          className="btn-primary-glow cursor-pointer rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating\u2026" : "Generate Plan"}
        </button>
      </div>

      {/* Duration selector */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-sm text-gray-400">Duration:</span>
        <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-[#3b82f61a] p-1">
          {[3, 5, 7].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                days === d
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Example topics */}
      {showExamples && (
        <div className="mt-6">
          <p className="mb-2 text-sm text-gray-400">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_TOPICS.map((example) => (
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
        <div className="mt-6 space-y-3">
          {Array.from({ length: days }, (_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-100 dark:border-gray-300/15 p-5"
            >
              <div className="mb-2 h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-300/10" />
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

      {/* Plan results */}
      {!loading && !error && plan.length > 0 && (
        <div className="mt-6">
          {/* Plan header */}
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 px-4 py-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Reading Plan: {activeTopic}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {plan.length} days &middot; {totalParagraphs} passages &middot; Built from semantic search results
            </p>
          </div>

          {/* Days */}
          <div className="space-y-3">
            {plan.map((day) => {
              const isExpanded = expandedDay === day.dayNumber;
              return (
                <div
                  key={day.dayNumber}
                  className="card-glow rounded-lg border border-gray-200 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Day header — always visible */}
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                    className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {day.dayNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {day.title}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {day.paragraphs.length} passage{day.paragraphs.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <svg
                      className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded paragraphs */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-300/10 px-5 py-4 space-y-4">
                      {day.paragraphs.map((p) => (
                        <div key={p.id} className="text-sm">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-gray-100 dark:bg-[#3b82f61a] px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-[#3b82f6]">
                              {p.standardReferenceId}
                            </span>
                            <span className="text-xs text-gray-400">
                              {p.paperTitle}
                              {p.sectionTitle ? ` — ${p.sectionTitle}` : ""}
                            </span>
                          </div>
                          <p className="leading-relaxed text-gray-700 dark:text-gray-400">
                            {truncate(p.text)}
                          </p>
                          <a
                            href={`https://www.urantiahub.com/api/redirect/papers/by-standard-reference-id/${p.standardReferenceId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            Read on UrantiaHub ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* How it works note */}
          <div className="mt-4 rounded-lg border border-gray-100 dark:border-gray-300/10 bg-gray-50 dark:bg-transparent px-4 py-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="font-medium text-gray-500 dark:text-gray-300">How it works:</span>{" "}
              This plan was generated client-side using the{" "}
              <code className="rounded bg-gray-100 dark:bg-[#3b82f61a] px-1.5 py-0.5 text-[11px] font-mono text-primary">
                POST /search/semantic
              </code>{" "}
              endpoint. Results are grouped by Paper into daily readings. Any API consumer can build their own reading plan experience on top of this endpoint.
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && hasGenerated && plan.length === 0 && (
        <div className="mt-6 rounded-lg border border-gray-100 dark:border-gray-300/15 bg-gray-50 dark:bg-[#3b82f61a] py-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No results found. Try a different topic.
          </p>
        </div>
      )}
    </div>
  );
}
