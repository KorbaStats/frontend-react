import type { PaginatedResponse } from "@/data/types";

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const CONTRACTED_STATUSES = [400, 401, 409];
const GENERIC_ERROR = "Coś poszło nie tak. Spróbuj ponownie później.";

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError && CONTRACTED_STATUSES.includes(error.status)) {
    return error.message;
  }
  return GENERIC_ERROR;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(path, {
    method,
    headers,
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  if (response.status === 204) return undefined as unknown as T;

  return (await response.json()) as T;
}

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function withQuery(path: string, params?: QueryParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export async function apiGet<T>(path: string, params?: QueryParams): Promise<T> {
  return apiRequest<T>(withQuery(path, params));
}

// backend ogranicza limit na stronę do 100 (backend/src/helpers/pagination.js)
const MAX_PAGE_LIMIT = 100;

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

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
    ) {
      return data.error;
    }
  } catch {
    return GENERIC_ERROR;
  }
  return GENERIC_ERROR;
}
