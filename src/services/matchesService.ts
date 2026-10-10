//TODO: verify against real API response once the backend has weather

import { matches } from "@/data/matches";
import { weatherByMatchId } from "@/data/weather";
import type {
  Match,
  PaginatedResponse,
  Weather,
} from "@/data/types";

export type MatchWithWeather = Match & { weather: Weather | null };

function withWeather(match: Match): MatchWithWeather {
  return { ...match, weather: weatherByMatchId.get(match.id) ?? null };
}

function byNewestFirst(a: Match, b: Match): number {
  return b.datetime.localeCompare(a.datetime);
}

// GET /api/matches?sort=datetime&order=desc
export async function getMatches(): Promise<
  PaginatedResponse<MatchWithWeather>
> {
  const data = matches.map(withWeather).sort(byNewestFirst);

  return {
    data,
    pagination: { total: data.length, page: 1, limit: data.length, pages: 1 },
  };
}

// GET /api/matches?sort=datetime&order=desc&limit=N
const DEFAULT_MATCHES_LIMIT = 10;

export async function getRecentMatches(
  limit = DEFAULT_MATCHES_LIMIT,
): Promise<MatchWithWeather[]> {
  const { data } = await getMatches();
  return data.slice(0, limit);
}

// TODO: przejść na GET /api/matches?team_id=X, gdy backend zacznie to przyjmować
export async function getTeamMatches(
  teamId: number,
): Promise<MatchWithWeather[]> {
  const { data } = await getMatches();
  return data.filter(
    (m) => m.home_team_id === teamId || m.away_team_id === teamId,
  );
}

// GET /api/matches/:id
export async function getMatchById(id: number): Promise<MatchWithWeather> {
  const match = matches.find((m) => m.id === id);
  if (!match) throw new Error(`Match id=${id} not found`);
  return withWeather(match);
}

// TODO: zweryfikować z prawdziwym API — backend nie ma takiego endpointu
export async function getAvailableSeasons(): Promise<string[]> {
  const seasons = new Set<string>();
  for (const match of matches) {
    if (match.season !== null) seasons.add(match.season);
  }
  return [...seasons].sort().reverse();
}

export async function getLeagueMatches(
  leagueId: number,
  season?: string,
): Promise<MatchWithWeather[]> {
  const {data} = await getMatches();

  return data.filter(
    (m) => m.league_id === leagueId && (m.season === season || season === undefined)
  );
}
