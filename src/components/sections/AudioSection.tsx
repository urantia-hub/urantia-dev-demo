"use client";

import { useState, useRef, useEffect } from "react";
import { getAudio, getParagraphContext } from "@/lib/api";

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

    try {
      const [audioRes, contextRes] = await Promise.all([
        getAudio(ref).catch(() => null),
        getParagraphContext(ref, 0),
      ]);

      // Extract paragraph text
      const target = contextRes?.data?.target;
      if (target) {
        setPassageText(target.text);
        setPassageRef(target.paragraphId || ref);
      } else {
        setPassageText(null);
        setPassageRef(ref);
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

  return (
    <div className="space-y-6">
      {/* Reference input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={inputRef}
          onChange={(e) => setInputRef(e.target.value)}
          placeholder="Enter a reference (e.g., 2:5.10)"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={loading || !inputRef.trim()}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
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
            className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm text-gray-700 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {preset.label}
            <span className="ml-1.5 text-xs text-gray-400">{preset.ref}</span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-3 text-sm text-gray-500">Loading audio and passage...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
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
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Voice
                </label>
                <select
                  id="voice-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              <p className="text-sm text-gray-500">
                Voice: <span className="font-medium text-gray-700">{voiceKeys[0]}</span>
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
          </div>

          {/* Passage text side */}
          {passageText && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
              <p className="mb-2 text-xs font-medium tracking-wide text-gray-400 uppercase">
                {passageRef}
              </p>
              <p className="leading-relaxed text-gray-800">{passageText}</p>
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
        </div>
      )}
    </div>
  );
}
