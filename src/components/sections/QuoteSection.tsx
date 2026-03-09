"use client";

import { useState, useEffect, useCallback } from "react";
import { getRandomParagraph } from "@/lib/api";
import type { Paragraph } from "@/lib/types";

export function QuoteSection() {
  const [quote, setQuote] = useState<Paragraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVisible(false);

    try {
      const res = await getRandomParagraph();
      setQuote(res.data);
      // Brief delay before fading in for smooth transition
      requestAnimationFrame(() => {
        setVisible(true);
      });
    } catch {
      setError("Failed to load quote. Please try again.");
      setVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const formatShareText = (q: Paragraph) =>
    `"${q.text}"\n\n— ${q.paperTitle} (${q.standardReferenceId})`;

  const handleCopy = async () => {
    if (!quote) return;
    try {
      await navigator.clipboard.writeText(formatShareText(quote));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  const handleShare = async () => {
    if (!quote) return;
    try {
      await navigator.share({
        title: "Urantia Papers Quote",
        text: formatShareText(quote),
      });
    } catch {
      // User cancelled or share failed — no action needed
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Loading skeleton */}
      {loading && !quote && (
        <div className="w-full max-w-3xl animate-pulse">
          <div className="border-l-4 border-gray-200 pl-6">
            <div className="mb-3 h-5 w-full rounded bg-gray-200" />
            <div className="mb-3 h-5 w-5/6 rounded bg-gray-200" />
            <div className="mb-3 h-5 w-4/6 rounded bg-gray-200" />
            <div className="h-5 w-3/6 rounded bg-gray-200" />
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <div className="h-10 w-28 rounded-lg bg-gray-200" />
            <div className="h-10 w-20 rounded-lg bg-gray-200" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="w-full max-w-3xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Quote display */}
      {quote && (
        <div
          className="w-full max-w-3xl transition-opacity duration-500 ease-in-out"
          style={{ opacity: visible && !loading ? 1 : 0 }}
        >
          {/* Quote text */}
          <blockquote className="border-l-4 border-primary/40 pl-6">
            <p className="text-lg leading-relaxed text-gray-800 sm:text-xl md:text-2xl md:leading-relaxed">
              {quote.text}
            </p>
          </blockquote>

          {/* Attribution */}
          <p className="mt-4 pl-6 text-sm text-gray-400">
            {quote.paperTitle}{" "}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              {quote.standardReferenceId}
            </span>
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={fetchQuote}
              disabled={loading}
              className="cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading…" : "Get Another Quote"}
            </button>
            <button
              onClick={handleCopy}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            {canShare && (
              <button
                onClick={handleShare}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
              >
                Share
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
