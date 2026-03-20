"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { UrantiaAPI } from "@urantia/api";
import type { Bookmark, Note, ReadingProgressEntry } from "@urantia/api";

const LOGIN_URL = "https://accounts.urantiahub.com";
const APP_ID = "demo";

interface Session {
  user: { id: string; email: string | null; scopes: string[] };
  accessToken: string;
  expiresAt: string;
}

type Tab = "bookmarks" | "notes" | "progress" | "preferences";

function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("urantia_auth_session");
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem("urantia_auth_session");
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

async function startSignIn() {
  // Generate PKCE
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  let binary = "";
  for (const byte of array) binary += String.fromCharCode(byte);
  const codeVerifier = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  );
  let digestBinary = "";
  for (const byte of new Uint8Array(digest))
    digestBinary += String.fromCharCode(byte);
  const codeChallenge = btoa(digestBinary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const state = crypto.randomUUID();
  const redirectUri = `${window.location.origin}/callback`;

  sessionStorage.setItem(
    "urantia_auth_pkce",
    JSON.stringify({ codeVerifier, state })
  );

  const params = new URLSearchParams({
    app_id: APP_ID,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    state,
    scope: "bookmarks,notes,reading-progress,preferences",
  });

  window.location.href = `${LOGIN_URL}/login?${params}`;
}

function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "\u2026";
}

// ─── Bookmarks Tab ───

function BookmarksTab({ token }: { token: string }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState("");
  const [category, setCategory] = useState("");
  const [adding, setAdding] = useState(false);

  const authedApi = useMemo(() => new UrantiaAPI({ token }), [token]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedApi.me.bookmarks.list();
      setBookmarks(res.data ?? []);
    } catch {
      /* ignore */
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    if (!ref.trim()) return;
    setAdding(true);
    try {
      await authedApi.me.bookmarks.create({
        ref: ref.trim(),
        category: category.trim() || undefined,
      });
      setRef("");
      setCategory("");
      load();
    } catch {
      /* ignore */
    }
    setAdding(false);
  }

  async function handleDelete(bookmarkRef: string) {
    await authedApi.me.bookmarks.delete(bookmarkRef);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="Reference (e.g., 2:0.1)"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          className="w-full sm:w-40 rounded-lg border border-gray-300 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !ref.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400">Loading bookmarks...</div>
      ) : bookmarks.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">No bookmarks yet. Add one above!</div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] p-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 dark:bg-[#3b82f61a] px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-[#3b82f6]">
                    {b.paragraph.standardReferenceId}
                  </span>
                  {b.category && (
                    <span className="text-xs text-gray-400">{b.category}</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {truncate(b.paragraph.text)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(b.paragraph.standardReferenceId)}
                className="shrink-0 text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notes Tab ───

function NotesTab({ token }: { token: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState("");
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const authedApi = useMemo(() => new UrantiaAPI({ token }), [token]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedApi.me.notes.list();
      setNotes(res.data ?? []);
    } catch {
      /* ignore */
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    if (!ref.trim() || !text.trim()) return;
    setAdding(true);
    try {
      await authedApi.me.notes.create({ ref: ref.trim(), text: text.trim() });
      setRef("");
      setText("");
      load();
    } catch {
      /* ignore */
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    await authedApi.me.notes.delete(id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="Reference (e.g., 2:0.1)"
          className="rounded-lg border border-gray-300 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your note..."
          rows={2}
          className="rounded-lg border border-gray-300 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !ref.trim() || !text.trim()}
          className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {adding ? "Saving..." : "Save Note"}
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">No notes yet.</div>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] p-3"
            >
              <div className="flex-1 min-w-0">
                <span className="rounded-full bg-gray-100 dark:bg-[#3b82f61a] px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-[#3b82f6]">
                  {n.paragraph.standardReferenceId}
                </span>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{n.text}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(n.id)}
                className="shrink-0 text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Reading Progress Tab ───

function ProgressTab({ token }: { token: string }) {
  const [progress, setProgress] = useState<ReadingProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refs, setRefs] = useState("");
  const [marking, setMarking] = useState(false);

  const authedApi = useMemo(() => new UrantiaAPI({ token }), [token]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedApi.me.readingProgress.get();
      setProgress(res.data ?? []);
    } catch {
      /* ignore */
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMark() {
    const refList = refs
      .split(/[,\s]+/)
      .map((r) => r.trim())
      .filter(Boolean);
    if (refList.length === 0) return;
    setMarking(true);
    try {
      await authedApi.me.readingProgress.mark(refList);
      setRefs("");
      load();
    } catch {
      /* ignore */
    }
    setMarking(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={refs}
          onChange={(e) => setRefs(e.target.value)}
          placeholder="Refs to mark as read (e.g., 1:0.1, 1:0.2, 1:0.3)"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleMark}
          disabled={marking || !refs.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {marking ? "Marking..." : "Mark Read"}
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400">Loading progress...</div>
      ) : progress.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">No reading progress yet.</div>
      ) : (
        <div className="space-y-2">
          {progress.map((p) => (
            <div
              key={p.paperId}
              className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Paper {p.paperId}: {p.paperTitle}
                </p>
                <p className="text-xs text-gray-400">
                  {p.readCount}/{p.totalParagraphs} paragraphs
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.min(p.percentage, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-12 text-right">
                  {p.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Preferences Tab ───

function PreferencesTab({ token }: { token: string }) {
  const [prefs, setPrefs] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const authedApi = useMemo(() => new UrantiaAPI({ token }), [token]);

  useEffect(() => {
    setLoading(true);
    authedApi.me.preferences
      .get()
      .then((res) => setPrefs(JSON.stringify(res.data ?? {}, null, 2)))
      .catch(() => setPrefs("{}"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSave() {
    setSaving(true);
    try {
      const parsed = JSON.parse(prefs);
      await authedApi.me.preferences.update(parsed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* ignore */
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="py-8 text-center text-sm text-gray-400">Loading preferences...</div>;
  }

  return (
    <div className="space-y-3">
      <textarea
        value={prefs}
        onChange={(e) => setPrefs(e.target.value)}
        rows={6}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] px-3 py-2 font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {saved ? "Saved!" : saving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}

// ─── Main Section ───

export function AccountSection() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("bookmarks");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSession(getSession());
  }, []);

  function handleSignOut() {
    localStorage.removeItem("urantia_auth_session");
    setSession(null);
  }

  if (!mounted) return null;

  // Signed out
  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="mb-4 text-gray-500 dark:text-gray-400">
          Sign in to demo authenticated endpoints — bookmarks, notes, reading progress, and preferences.
        </p>
        <button
          onClick={startSignIn}
          className="btn-primary-glow rounded-lg bg-primary px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          Sign in with Urantia
        </button>
        <p className="mt-3 text-xs text-gray-400">
          Powered by{" "}
          <a
            href="https://www.npmjs.com/package/@urantia/auth"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @urantia/auth
          </a>{" "}
          + OAuth with PKCE
        </p>
      </div>
    );
  }

  // Signed in
  const tabs: { id: Tab; label: string }[] = [
    { id: "bookmarks", label: "Bookmarks" },
    { id: "notes", label: "Notes" },
    { id: "progress", label: "Progress" },
    { id: "preferences", label: "Preferences" },
  ];

  return (
    <div>
      {/* User header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Signed in as{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {session.user.email}
            </span>
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-gray-300 dark:border-gray-300/15 bg-white dark:bg-[#3b82f61a] px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-red-400 hover:text-red-400"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-[#3b82f61a] p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "bookmarks" && <BookmarksTab token={session.accessToken} />}
      {activeTab === "notes" && <NotesTab token={session.accessToken} />}
      {activeTab === "progress" && <ProgressTab token={session.accessToken} />}
      {activeTab === "preferences" && <PreferencesTab token={session.accessToken} />}
    </div>
  );
}
