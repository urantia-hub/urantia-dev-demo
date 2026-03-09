"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getEntities, getEntityParagraphs } from "@/lib/api";
import type { Entity, EntityType, Paragraph, PaginationMeta } from "@/lib/types";

const ENTITY_TYPES: { label: string; value: EntityType | null }[] = [
  { label: "All", value: null },
  { label: "Beings", value: "being" },
  { label: "Places", value: "place" },
  { label: "Orders", value: "order" },
  { label: "Races", value: "race" },
  { label: "Religions", value: "religion" },
  { label: "Concepts", value: "concept" },
];

const TYPE_COLORS: Record<EntityType, string> = {
  being: "bg-blue-100 text-blue-700",
  place: "bg-green-100 text-green-700",
  order: "bg-purple-100 text-purple-700",
  race: "bg-amber-100 text-amber-700",
  religion: "bg-rose-100 text-rose-700",
  concept: "bg-slate-100 text-slate-700",
};

function truncate(text: string, max = 150): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-100 p-5">
      <div className="mb-3 h-5 w-2/3 rounded bg-gray-200" />
      <div className="mb-2 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
        <div className="h-5 w-24 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

function EntityCard({
  entity,
  isExpanded,
  onToggle,
}: {
  entity: Entity;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [loadingParagraphs, setLoadingParagraphs] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (isExpanded && !hasFetched.current) {
      hasFetched.current = true;
      setLoadingParagraphs(true);
      getEntityParagraphs(entity.id, 1, 3)
        .then((res) => setParagraphs(res.data ?? []))
        .catch(() => {
          setParagraphs([]);
          hasFetched.current = false;
        })
        .finally(() => setLoadingParagraphs(false));
    }
  }, [isExpanded, entity.id]);

  return (
    <div
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">{entity.name}</h3>
        <svg
          className={`mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[entity.type]}`}
        >
          {entity.type}
        </span>
        <span className="text-xs text-gray-400">
          {entity.citationCount} {entity.citationCount === 1 ? "mention" : "mentions"}
        </span>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          {entity.description && (
            <p className="text-sm leading-relaxed text-gray-600">{entity.description}</p>
          )}

          {entity.aliases && entity.aliases.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500">Aliases: </span>
              <span className="text-xs text-gray-600">{entity.aliases.join(", ")}</span>
            </div>
          )}

          {entity.seeAlso && entity.seeAlso.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500">See also: </span>
              <span className="text-xs text-gray-600">{entity.seeAlso.join(", ")}</span>
            </div>
          )}

          {loadingParagraphs && (
            <div className="flex items-center gap-2 py-2">
              <svg
                className="h-4 w-4 animate-spin text-primary"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-xs text-gray-400">Loading citations…</span>
            </div>
          )}

          {!loadingParagraphs && paragraphs.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-500">Citing passages:</span>
              {paragraphs.map((p) => (
                <div
                  key={p.id}
                  className="rounded-md bg-gray-50 px-3 py-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="mb-1 inline-block rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                    {p.standardReferenceId}
                  </span>
                  <p className="text-xs leading-relaxed text-gray-600">
                    {truncate(p.text)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function EntitySection() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [activeType, setActiveType] = useState<EntityType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEntities = useCallback(
    async (p: number, type: EntityType | null, q: string, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params: { page: number; limit: number; type?: string; q?: string } = {
          page: p,
          limit: 12,
        };
        if (type) params.type = type;
        if (q.trim()) params.q = q.trim();

        const res = await getEntities(params);
        if (append) {
          setEntities((prev) => [...prev, ...(res.data ?? [])]);
        } else {
          setEntities(res.data ?? []);
        }
        setMeta(res.meta ?? null);
      } catch {
        setError("Failed to load entities. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    fetchEntities(1, null, "", false);
  }, [fetchEntities]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleTypeChange = (type: EntityType | null) => {
    setActiveType(type);
    setPage(1);
    setExpandedId(null);
    fetchEntities(1, type, searchQuery, false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setExpandedId(null);
      fetchEntities(1, activeType, value, false);
    }, 300);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEntities(nextPage, activeType, searchQuery, true);
  };

  const hasMore = meta ? page < meta.totalPages : false;

  return (
    <div>
      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
        {ENTITY_TYPES.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => handleTypeChange(value)}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeType === value
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="mt-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search entities by name…"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Entity grid */}
      {!loading && !error && entities.length > 0 && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                isExpanded={expandedId === entity.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === entity.id ? null : entity.id))
                }
              />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Loading…
                  </span>
                ) : (
                  "Load more"
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !error && entities.length === 0 && (
        <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 py-10 text-center">
          <p className="text-sm text-gray-500">
            No entities found. Try a different search or filter.
          </p>
        </div>
      )}
    </div>
  );
}
