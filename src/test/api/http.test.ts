import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  apiGet,
  apiGetAllPages,
  apiRequest,
  setAccessToken,
  toUserMessage,
} from "@/services/http";

const fetchMock = vi.fn<typeof fetch>();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const calledUrl = (index: number) => fetchMock.mock.calls[index][0];
const calledHeaders = (index: number) =>
  fetchMock.mock.calls[index][1]?.headers as Record<string, string>;

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  setAccessToken(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("zwraca odpowiedź backendu jako JSON", async () => {
    fetchMock.mockResolvedValueOnce(json({ id: 1, name: "Legia" }));
    await expect(apiRequest("/api/teams/1")).resolves.toEqual({ id: 1, name: "Legia" });
  });

  it("dokleja token dostępu w nagłówku Authorization", async () => {
    setAccessToken("token-123");
    fetchMock.mockResolvedValueOnce(json({}));

    await apiRequest("/api/auth/me");
    expect(calledHeaders(0).Authorization).toBe("Bearer token-123");
  });

  it("bez tokenu nie wysyła nagłówka Authorization", async () => {
    fetchMock.mockResolvedValueOnce(json({}));

    await apiRequest("/api/teams");
    expect(calledHeaders(0).Authorization).toBeUndefined();
  });

  it("wysyła body jako JSON z odpowiednim nagłówkiem", async () => {
    fetchMock.mockResolvedValueOnce(json({}));

    await apiRequest("/api/teams", { method: "POST", body: { name: "Wisła" } });
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe('{"name":"Wisła"}');
    expect(calledHeaders(0)["Content-Type"]).toBe("application/json");
  });

  it("dla odpowiedzi 204 zwraca undefined", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(apiRequest("/api/teams/1", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("zamienia błąd backendu na ApiError z jego komunikatem", async () => {
    fetchMock.mockResolvedValueOnce(json({ error: "Nie znaleziono drużyny" }, 404));

    const error = await apiRequest("/api/teams/999").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, message: "Nie znaleziono drużyny" });
  });

  it("dla odpowiedzi bez JSON-a daje ogólny komunikat", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Bad Gateway", { status: 502 }));
    await expect(apiRequest("/api/teams")).rejects.toThrow("Coś poszło nie tak");
  });
});

describe("odświeżanie sesji", () => {
  it("po 401 odświeża token i ponawia żądanie z nowym tokenem", async () => {
    setAccessToken("stary-token");
    fetchMock
      .mockResolvedValueOnce(json({ error: "Token wygasł" }, 401))
      .mockResolvedValueOnce(json({ accessToken: "nowy-token" }))
      .mockResolvedValueOnce(json({ ok: true }));

    await expect(apiRequest("/api/favourites/teams")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(calledUrl(1)).toBe("/api/auth/refresh");
    expect(calledHeaders(2).Authorization).toBe("Bearer nowy-token");
  });

  it("gdy odświeżenie się nie uda, zwraca błąd 401 i czyści token", async () => {
    setAccessToken("stary-token");
    fetchMock
      .mockResolvedValueOnce(json({ error: "Token wygasł" }, 401))
      .mockResolvedValueOnce(json({ error: "Brak sesji" }, 401))
      .mockResolvedValueOnce(json({}));

    await expect(apiRequest("/api/favourites/teams")).rejects.toMatchObject({ status: 401 });

    await apiRequest("/api/teams");
    expect(calledHeaders(2).Authorization).toBeUndefined();
  });

  it("nie odświeża tokenu dla ścieżek /api/auth/", async () => {
    setAccessToken("stary-token");
    fetchMock.mockResolvedValueOnce(json({ error: "Złe hasło" }, 401));

    await expect(apiRequest("/api/auth/login", { method: "POST", body: {} })).rejects.toThrow("Złe hasło");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("nie odświeża tokenu, gdy użytkownik nie był zalogowany", async () => {
    fetchMock.mockResolvedValueOnce(json({ error: "Brak tokenu" }, 401));

    await expect(apiRequest("/api/favourites/teams")).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("apiGet i apiGetAllPages", () => {
  it("dokleja parametry zapytania i pomija puste", async () => {
    fetchMock.mockResolvedValueOnce(json([]));

    await apiGet("/api/matches", { season: "2025/2026", league: null, q: "", page: 2 });
    expect(calledUrl(0)).toBe("/api/matches?season=2025%2F2026&page=2");
  });

  it("pobiera wszystkie strony i skleja dane", async () => {
    const page = (data: number[], number: number) =>
      json({ data, pagination: { total: 5, page: number, limit: 100, pages: 3 } });
    fetchMock
      .mockResolvedValueOnce(page([1, 2], 1))
      .mockResolvedValueOnce(page([3, 4], 2))
      .mockResolvedValueOnce(page([5], 3));

    const result = await apiGetAllPages<number>("/api/teams");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(calledUrl(0)).toBe("/api/teams?page=1&limit=100");
    expect(result.data).toEqual([1, 2, 3, 4, 5]);
    expect(result.pagination).toEqual({ total: 5, page: 1, limit: 5, pages: 1 });
  });

  it("przy jednej stronie wysyła tylko jedno żądanie", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: [1], pagination: { total: 1, page: 1, limit: 100, pages: 1 } }));

    await apiGetAllPages("/api/leagues");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("toUserMessage", () => {
  it.each([400, 401, 403, 404, 409])("dla statusu %i pokazuje komunikat backendu", (status) => {
    expect(toUserMessage(new ApiError(status, "Komunikat z backendu"))).toBe("Komunikat z backendu");
  });

  it("dla błędu serwera pokazuje ogólny komunikat", () => {
    expect(toUserMessage(new ApiError(500, "SQL error"))).toBe(
      "Coś poszło nie tak. Spróbuj ponownie później.",
    );
  });

  it("dla innego błędu niż ApiError pokazuje ogólny komunikat", () => {
    expect(toUserMessage(new TypeError("Failed to fetch"))).toBe(
      "Coś poszło nie tak. Spróbuj ponownie później.",
    );
  });
});
