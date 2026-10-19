import type { PaginatedResponse } from "@/data/types";

// w dev vite proxuje /api na backend (vite.config.ts), w dockerze robi to nginx
const API_URL = import.meta.env.VITE_API_URL ?? "/api";

// backend ogranicza limit na stronę do 100 (backend/src/helpers/pagination.js)
const MAX_PAGE_LIMIT = 100;

type QueryParams = Record<string, string | number | boolean | null | undefined>;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildUrl(path: string, params?: QueryParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return `${API_URL}${path}${query ? `?${query}` : ""}`;
}

export async function apiGet<T>(path: string, params?: QueryParams): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.error ?? `Błąd zapytania ${path} (${response.status})`,
    );
  }

  return response.json();
}

// pobiera wszystkie strony paginowanego endpointu i skleja je w jedną odpowiedź
export async function apiGetAllPages<T>(
  path: string,
  params?: QueryParams,
): Promise<PaginatedResponse<T>> {
  const first = await apiGet<PaginatedResponse<T>>(path, {
    ...params,
    page: 1,
    limit: MAX_PAGE_LIMIT,
  });

  const restPages = Array.from(
    { length: Math.max(0, first.pagination.pages - 1) },
    (_, i) => i + 2,
  );
  const rest = await Promise.all(
    restPages.map((page) =>
      apiGet<PaginatedResponse<T>>(path, { ...params, page, limit: MAX_PAGE_LIMIT }),
    ),
  );

  const data = [first, ...rest].flatMap((response) => response.data);
  return {
    data,
    pagination: { total: data.length, page: 1, limit: data.length, pages: 1 },
  };
}
