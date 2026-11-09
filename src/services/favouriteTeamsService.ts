import { apiGet, apiRequest } from "@/services/http";

// ulubione drużyny zalogowanego użytkownika (backend: FavouritesController)

// GET /api/favourites/teams - id drużyn, od ostatnio dodanej
export async function getFavouriteTeamIds(): Promise<number[]> {
  return apiGet<number[]>("/api/favourites/teams");
}

// POST /api/favourites/teams/:teamId
export async function addFavouriteTeam(teamId: number): Promise<void> {
  await apiRequest<void>(`/api/favourites/teams/${teamId}`, { method: "POST" });
}

// DELETE /api/favourites/teams/:teamId
export async function removeFavouriteTeam(teamId: number): Promise<void> {
  await apiRequest<void>(`/api/favourites/teams/${teamId}`, { method: "DELETE" });
}

// wcześniej ulubione były trzymane w localStorage - przy pierwszym logowaniu przenosimy je na konto
const LEGACY_KEY = "korbastats:favourite-teams";

export function takeLegacyFavouriteTeamIds(): number[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw === null) return [];
    localStorage.removeItem(LEGACY_KEY);

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => Number.isInteger(id))
      : [];
  } catch {
    return [];
  }
}
