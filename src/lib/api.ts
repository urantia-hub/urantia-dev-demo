import type {
  SearchResponse,
  ContextResponse,
  EntityListResponse,
  EntityParagraphsResponse,
  Paragraph,
  Entity,
} from "./types";

const BASE_URL = "https://api.urantia.dev";

export async function searchParagraphs(q: string, type: "and" | "or" | "phrase" = "and", limit = 5): Promise<SearchResponse> {
  const res = await fetch(`${BASE_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, type, limit }),
  });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

export async function semanticSearch(q: string, limit = 5): Promise<SearchResponse> {
  const res = await fetch(`${BASE_URL}/search/semantic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, limit }),
  });
  if (!res.ok) throw new Error(`Semantic search failed: ${res.status}`);
  return res.json();
}

export async function getRandomParagraph(): Promise<{ data: Paragraph }> {
  const res = await fetch(`${BASE_URL}/paragraphs/random`);
  if (!res.ok) throw new Error(`Random paragraph failed: ${res.status}`);
  return res.json();
}

export async function getParagraphContext(ref: string, window = 2): Promise<ContextResponse> {
  const res = await fetch(`${BASE_URL}/paragraphs/${encodeURIComponent(ref)}/context?window=${window}`);
  if (!res.ok) throw new Error(`Context lookup failed: ${res.status}`);
  return res.json();
}

export async function getEntities(params: { page?: number; limit?: number; type?: string; q?: string } = {}): Promise<EntityListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.type) searchParams.set("type", params.type);
  if (params.q) searchParams.set("q", params.q);
  const res = await fetch(`${BASE_URL}/entities?${searchParams}`);
  if (!res.ok) throw new Error(`Entities fetch failed: ${res.status}`);
  return res.json();
}

export async function getEntity(id: string): Promise<{ data: Entity }> {
  const res = await fetch(`${BASE_URL}/entities/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Entity fetch failed: ${res.status}`);
  return res.json();
}

export async function getEntityParagraphs(id: string, page = 1, limit = 5): Promise<EntityParagraphsResponse> {
  const res = await fetch(`${BASE_URL}/entities/${encodeURIComponent(id)}/paragraphs?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`Entity paragraphs failed: ${res.status}`);
  return res.json();
}

export async function getAudio(paragraphId: string): Promise<{ data: { paragraphId: string; audio: Record<string, Record<string, { format: string; url: string }>> } }> {
  const res = await fetch(`${BASE_URL}/audio/${encodeURIComponent(paragraphId)}`);
  if (!res.ok) throw new Error(`Audio fetch failed: ${res.status}`);
  return res.json();
}
