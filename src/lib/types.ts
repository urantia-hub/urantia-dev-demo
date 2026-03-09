export type EntityType = "being" | "place" | "order" | "race" | "religion" | "concept";

export interface Paragraph {
  id: string;
  standardReferenceId: string;
  sortId: string;
  paperId: string;
  sectionId: string | null;
  partId: string;
  paperTitle: string;
  sectionTitle: string | null;
  paragraphId: string;
  text: string;
  htmlText: string;
  labels: string[] | null;
  audio: Record<string, Record<string, { format: string; url: string }>> | null;
  entities?: EntityMention[];
}

export interface EntityMention {
  id: string;
  name: string;
  type: EntityType;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  aliases: string[] | null;
  description: string | null;
  seeAlso: string[] | null;
  citationCount: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchResult extends Paragraph {
  rank?: number;
  similarity?: number;
}

export interface SearchResponse {
  data: SearchResult[];
  meta: PaginationMeta;
}

export interface ContextResponse {
  data: {
    target: Paragraph;
    before: Paragraph[];
    after: Paragraph[];
  };
}

export interface EntityListResponse {
  data: Entity[];
  meta: PaginationMeta;
}

export interface EntityParagraphsResponse {
  data: Paragraph[];
  meta: PaginationMeta;
}
