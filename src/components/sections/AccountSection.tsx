"use client";

import { useState, useEffect, useCallback } from "react";
import { UrantiaAPI } from "@urantia/api";
import { signedOutFor } from "@/server/signout-answer";
import type { Bookmark, Note, ReadingProgressEntry } from "@urantia/api";

// The person who is signed in. The tokens stay on the server, in a cookie that scripts cannot read.
interface User {
  id: string;
  email: string | null;
  scopes: string[];
}

type Tab = "bookmarks" | "notes" | "progress" | "preferences";

// The person's data goes through this site's own /api/me, which adds the token on the server.
// When a call for the person's data fails, the page asks the server if the person is still signed in.
const SESSION_CHECK = "demo-session-check";
const checkSession = () => window.dispatchEvent(new Event(SESSION_CHECK));
const authedApi = new UrantiaAPI({ baseUrl: "/api" });

const SIGN_IN_PROBLEMS: Record<string, string> = {
  denied: "The sign-in was not allowed.",
  expired: "The sign-in took too long, or it was started in another browser. Try again.",
  failed: "The sign-in did not finish. Try again.",
};

async function fetchUser(): Promise<{ user: User | null; unavailable: boolean }> {
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    const body = await res.json();
    return { user: body.user ?? null, unavailable: res.status === 503 };
  } catch {
    return { user: null, unavailable: true };
  }
}

function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "\u2026";
}

// ─── Bookmarks Tab ───

function BookmarksTab() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState("");
  const [category, setCategory] = useState("");
  const [adding, setAdding] = useState(false);


  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedApi.me.bookmarks.list();
      setBookmarks(res.data ?? []);
    } catch {
      checkSession();
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      checkSession();
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
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          className="w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !ref.trim()}
          className="rounded-lg btn-amber px-4 py-2 text-sm font-medium disabled:opacity-50"
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
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {b.paragraph.standardReferenceId}
                  </span>
                  {b.category && (
                    <span className="text-xs text-gray-400">{b.category}</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
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

function NotesTab() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState("");
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);


  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedApi.me.notes.list();
      setNotes(res.data ?? []);
    } catch {
      checkSession();
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      checkSession();
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
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your note..."
          rows={2}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !ref.trim() || !text.trim()}
          className="self-start rounded-lg btn-amber px-4 py-2 text-sm font-medium disabled:opacity-50"
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
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex-1 min-w-0">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {n.paragraph.standardReferenceId}
                </span>
                <p className="mt-1 text-sm text-gray-700">{n.text}</p>
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

function ProgressTab() {
  const [progress, setProgress] = useState<ReadingProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refs, setRefs] = useState("");
  const [marking, setMarking] = useState(false);


  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedApi.me.readingProgress.get();
      setProgress(res.data ?? []);
    } catch {
      checkSession();
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      checkSession();
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
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleMark}
          disabled={marking || !refs.trim()}
          className="rounded-lg btn-amber px-4 py-2 text-sm font-medium disabled:opacity-50"
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
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Paper {p.paperId}: {p.paperTitle}
                </p>
                <p className="text-xs text-gray-400">
                  {p.readCount}/{p.totalParagraphs} paragraphs
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-amber"
                    style={{ width: `${Math.min(p.percentage, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500 w-12 text-right">
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

function PreferencesTab() {
  const [prefs, setPrefs] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);


  useEffect(() => {
    setLoading(true);
    authedApi.me.preferences
      .get()
      .then((res) => setPrefs(JSON.stringify(res.data ?? {}, null, 2)))
      .catch(() => setPrefs("{}"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const parsed = JSON.parse(prefs);
      await authedApi.me.preferences.update(parsed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      checkSession();
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
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg btn-amber px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {saved ? "Saved!" : saving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}

// ─── Main Section ───

export function AccountSection() {
  const [user, setUser] = useState<User | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("bookmarks");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const problem = new URLSearchParams(window.location.search).get("signin");
    fetchUser().then(({ user, unavailable }) => {
      setUser(user);
      setNotice(
        unavailable
          ? "The sign-in service has a problem at the moment. Try again in a minute."
          : problem
            ? (SIGN_IN_PROBLEMS[problem] ?? null)
            : null,
      );
      setMounted(true);
    });
    // The person can remove this app on the accounts site, in another tab. This site's server ends the
    // session at the next call. The page asks again when it gets the focus, and after each failed call.
    const recheck = () => {
      fetchUser().then(({ user, unavailable }) => {
        if (!unavailable) setUser(user);
      });
    };
    window.addEventListener("focus", recheck);
    window.addEventListener(SESSION_CHECK, recheck);
    // A session from an older version of this demo was kept in the browser. It is not used now.
    try {
      localStorage.removeItem("urantia_auth_session");
    } catch {
      // Storage is not available.
    }
    return () => {
      window.removeEventListener("focus", recheck);
      window.removeEventListener(SESSION_CHECK, recheck);
    };
  }, []);

  // The sign-out stays on this page. The next sign-in shows the sign-in page of the accounts site.
  // The UrantiaHub account itself stays signed in: the person ends that on the account page.
  async function handleSignOut() {
    let status: number | undefined;
    let body: { signedOut?: boolean } | null = null;
    try {
      const res = await fetch("/api/auth/signout", { method: "POST" });
      status = res.status;
      body = await res.json();
    } catch {
      // Handled below: with no answer, the person is not signed out.
    }
    // The page says "signed out" only when the server ended the session.
    if (!signedOutFor(status, body)) {
      setNotice("The sign-out did not finish. You are still signed in. Try again.");
      checkSession();
      return;
    }
    setNotice(null);
    setUser(null);
  }

  if (!mounted) return null;

  // Signed out
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="mb-4 text-gray-500">
          Sign in to demo authenticated endpoints: bookmarks, notes, reading progress, and preferences.
        </p>
        {notice && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {notice}
          </p>
        )}
        {/* A plain link: the server route starts the sign-in and sends the browser on. */}
        <a href="/api/auth/start" className="inline-block rounded-lg btn-amber px-8 py-3 text-base font-medium transition-colors no-underline">
          Sign in
        </a>
        <p className="mt-3 text-xs text-gray-400">Accounts are shared with UrantiaHub.</p>
        <p className="mt-1 text-xs text-gray-400">
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
          <p className="text-sm text-gray-500">
            Signed in as{" "}
            <span className="font-medium text-gray-900">
              {user.email}
            </span>
          </p>
          {/* Where the person sees which apps have access, removes one, or deletes the account. */}
          <a
            href="https://accounts.urantiahub.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm text-gray-500 underline hover:text-gray-900"
          >
            Manage your UrantiaHub account
          </a>
        </div>
        <button
          onClick={() => handleSignOut()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:border-red-400 hover:text-red-400"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "btn-amber"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "bookmarks" && <BookmarksTab />}
      {activeTab === "notes" && <NotesTab />}
      {activeTab === "progress" && <ProgressTab />}
      {activeTab === "preferences" && <PreferencesTab />}
    </div>
  );
}
