"use client";

import { useState, useRef, useEffect } from "react";
import { getAudio, getParagraphContext } from "@/lib/api";
import { getSpotifyUrl } from "@/lib/spotify";

const PRESETS = [
  { label: "The Father's Love", ref: "2:5.10" },
  { label: "The Golden Rule", ref: "147:4.8" },
  { label: "Faith", ref: "101:3.4" },
  { label: "Prayer", ref: "91:9.1" },
];

interface AudioEntry {
  format: string;
  url: string;
}

interface AudioData {
  [narrator: string]: AudioEntry;
}

export function AudioSection() {
  const [inputRef, setInputRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passageText, setPassageText] = useState<string | null>(null);
  const [passageRef, setPassageRef] = useState<string | null>(null);
  const [voices, setVoices] = useState<Record<string, AudioEntry>>({});
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [paperId, setPaperId] = useState<string | null>(null);
  const [paperTitle, setPaperTitle] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (selectedVoice && voices[selectedVoice]) {
      setAudioUrl(voices[selectedVoice].url);
    }
  }, [selectedVoice, voices]);

  async function fetchPassage(ref: string) {
    setLoading(true);
    setError(null);
    setPassageText(null);
    setAudioUrl(null);
    setVoices({});
    setSelectedVoice("");
    setPaperId(null);
    setPaperTitle(null);

    try {
      const [audioRes, contextRes] = await Promise.all([
        getAudio(ref).catch(() => null),
        getParagraphContext(ref, 1),
      ]);

      // Extract paragraph text
      const target = contextRes?.data?.target;
      if (target) {
        setPassageText(target.text);
        setPassageRef(target.standardReferenceId || ref);
        setPaperId(target.paperId || null);
        setPaperTitle(target.paperTitle || null);
      } else {
        setPassageText(null);
        setPassageRef(ref);
        setPaperId(null);
        setPaperTitle(null);
      }

      // Parse audio voices
      const audioObj = audioRes?.data?.audio;
      if (audioObj && typeof audioObj === "object") {
        // audio is nested: { en: { narrator1: { format, url } } }
        // Flatten to find all narrators across all languages
        const allVoices: Record<string, AudioEntry> = {};
        for (const lang of Object.keys(audioObj)) {
          const narrators = audioObj[lang];
          if (narrators && typeof narrators === "object") {
            for (const narrator of Object.keys(narrators)) {
              const entry = narrators[narrator];
              if (entry?.url) {
                const label = Object.keys(audioObj).length > 1
                  ? `${narrator} (${lang})`
                  : narrator;
                allVoices[label] = entry;
              }
            }
          }
        }

        if (Object.keys(allVoices).length > 0) {
          setVoices(allVoices);
          const firstVoice = Object.keys(allVoices)[0];
          setSelectedVoice(firstVoice);
        } else {
          setError("No audio available for this passage.");
        }
      } else {
        setError("No audio available for this passage.");
      }
    } catch {
      setError("Could not load passage. Please check the reference and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputRef.trim();
    if (!trimmed) return;
    fetchPassage(trimmed);
  }

  function handlePreset(ref: string) {
    setInputRef(ref);
    fetchPassage(ref);
  }

  const voiceKeys = Object.keys(voices);
  const spotifyUrl = paperId ? getSpotifyUrl(paperId) : null;

  return (
    <div className="space-y-6">
      {/* Reference input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={inputRef}
          onChange={(e) => setInputRef(e.target.value)}
          placeholder="Enter a reference (e.g., 2:5.10)"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={loading || !inputRef.trim()}
          className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Play"}
        </button>
      </form>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.ref}
            onClick={() => handlePreset(preset.ref)}
            disabled={loading}
            className="rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-1.5 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {preset.label}
            <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">{preset.ref}</span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading audio and passage...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-4 py-3 text-sm text-amber-800 dark:text-amber-400">
          {error}
        </div>
      )}

      {/* Audio player + passage text */}
      {!loading && audioUrl && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Audio player side */}
          <div className="space-y-4">
            {/* Voice selector */}
            {voiceKeys.length > 1 && (
              <div>
                <label
                  htmlFor="voice-select"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Voice
                </label>
                <select
                  id="voice-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {voiceKeys.map((voice) => (
                    <option key={voice} value={voice}>
                      {voice}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {voiceKeys.length === 1 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Voice: <span className="font-medium text-gray-700 dark:text-gray-300">{voiceKeys[0]}</span>
              </p>
            )}

            {/* Audio element */}
            <audio
              ref={audioRef}
              key={audioUrl}
              controls
              src={audioUrl}
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>

            {/* Spotify link */}
            {spotifyUrl && (
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 px-3.5 py-1.5 text-sm font-medium text-[#1DB954] transition-colors hover:bg-[#1DB954]/20 hover:border-[#1DB954]/50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                Listen on Spotify
                {paperTitle && (
                  <span className="text-[#1DB954]/70">
                    — Paper {paperId}: {paperTitle}
                  </span>
                )}
              </a>
            )}
          </div>

          {/* Passage text side */}
          {passageText && (
            <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-5">
              <p className="mb-2 text-xs font-medium tracking-wide text-gray-400 dark:text-gray-500 uppercase">
                {passageRef}
              </p>
              <p className="leading-relaxed text-gray-800 dark:text-gray-200">{passageText}</p>
              {passageRef && (
                <a
                  href={`https://www.urantiahub.com/api/redirect/papers/by-standard-reference-id/${passageRef}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Read on UrantiaHub ↗
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Show passage text even without audio */}
      {!loading && !audioUrl && passageText && (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
          <p className="mb-2 text-xs font-medium tracking-wide text-gray-400 uppercase">
            {passageRef}
          </p>
          <p className="leading-relaxed text-gray-800">{passageText}</p>
          {passageRef && (
            <a
              href={`https://www.urantiahub.com/api/redirect/papers/by-standard-reference-id/${passageRef}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Read on UrantiaHub ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
