import type { Iso8601, CursorPaginationMeta } from "./common";

export type ItemId = string;

/**
 * Generic searchable item used across mocks. The backend can swap the
 * concrete entity (Article / Product / Project) without changing the
 * contract — only the `kind` discriminator changes.
 */
export interface SearchItem {
  id: ItemId;
  kind: "article" | "product" | "project";
  title: string;
  summary: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  score: number;
  authorName: string;
  createdAt: Iso8601;
  updatedAt: Iso8601;
}

export interface SearchFilters {
  q?: string;
  tags?: string[];
  status?: SearchItem["status"][];
  /** Inclusive lower bound on `score`. */
  minScore?: number;
  /** Inclusive upper bound on `score`. */
  maxScore?: number;
  createdFrom?: Iso8601;
  createdTo?: Iso8601;
}

export type SearchSortField = "createdAt" | "updatedAt" | "score" | "title";
export type SortDirection = "asc" | "desc";

export interface SearchSort {
  field: SearchSortField;
  direction: SortDirection;
}

export interface SearchRequest {
  filters?: SearchFilters;
  sort?: SearchSort;
  /** Opaque base64 cursor of `{ sortKey, id }`. */
  cursor?: string;
  limit?: number;
}

export interface SearchResponse {
  items: SearchItem[];
  pagination: CursorPaginationMeta;
}
