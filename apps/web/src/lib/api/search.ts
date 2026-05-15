import type {
  SearchItem,
  SearchRequest,
  SearchResponse,
} from "@repo/types";
import { env } from "@/lib/env";
import { http } from "./http";
import { delay, decodeCursor, encodeCursor, mockError } from "@/lib/mocks/util";
import { buildSearchDataset } from "@/lib/mocks/dataset";

export interface SearchApi {
  search: (req: SearchRequest) => Promise<SearchResponse>;
  getItem: (id: string) => Promise<SearchItem>;
}

const realSearch: SearchApi = {
  search: (req) =>
    http<SearchResponse>("/api/items/search", { method: "POST", body: req }),
  getItem: (id) => http<SearchItem>(`/api/items/${id}`),
};

interface CursorShape {
  lastSortValue: string | number;
  lastId: string;
}

const dataset = buildSearchDataset();

function applyFilters(
  items: SearchItem[],
  filters: SearchRequest["filters"]
): SearchItem[] {
  if (!filters) return items;
  return items.filter((it) => {
    if (filters.q) {
      const q = filters.q.toLowerCase();
      if (
        !it.title.toLowerCase().includes(q) &&
        !it.summary.toLowerCase().includes(q) &&
        !it.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.every((t) => it.tags.includes(t))) return false;
    }
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(it.status)) return false;
    }
    if (filters.minScore !== undefined && it.score < filters.minScore) {
      return false;
    }
    if (filters.maxScore !== undefined && it.score > filters.maxScore) {
      return false;
    }
    if (filters.createdFrom && it.createdAt < filters.createdFrom) {
      return false;
    }
    if (filters.createdTo && it.createdAt > filters.createdTo) {
      return false;
    }
    return true;
  });
}

function applySort(
  items: SearchItem[],
  sort: SearchRequest["sort"]
): SearchItem[] {
  const field = sort?.field ?? "createdAt";
  const dir = sort?.direction ?? "desc";
  const sign = dir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av < bv) return -1 * sign;
    if (av > bv) return 1 * sign;
    return a.id.localeCompare(b.id) * sign;
  });
}

const mockSearch: SearchApi = {
  async search(req) {
    await delay(280);
    const filtered = applyFilters(dataset, req.filters);
    const sorted = applySort(filtered, req.sort);
    const limit = Math.min(Math.max(req.limit ?? 25, 1), 100);

    let startIndex = 0;
    if (req.cursor) {
      try {
        const cur = decodeCursor<CursorShape>(req.cursor);
        const idx = sorted.findIndex((i) => i.id === cur.lastId);
        startIndex = idx >= 0 ? idx + 1 : 0;
      } catch {
        throw mockError("validation_error", "Invalid cursor", 400);
      }
    }

    const slice = sorted.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < sorted.length;
    const last = slice[slice.length - 1];
    const sortField = req.sort?.field ?? "createdAt";

    return {
      items: slice,
      pagination: {
        nextCursor:
          hasMore && last
            ? encodeCursor({
                lastSortValue: last[sortField],
                lastId: last.id,
              } satisfies CursorShape)
            : null,
        hasMore,
        total: sorted.length,
      },
    };
  },
  async getItem(id) {
    await delay(180);
    const found = dataset.find((i) => i.id === id);
    if (!found) throw mockError("not_found", `Item ${id} not found`, 404);
    return found;
  },
};

export const searchApi: SearchApi =
  env.apiMode === "mock" ? mockSearch : realSearch;
