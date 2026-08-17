// Mocked data - change later for backend endpoints
// Shape verified against backend migration 20260417113614_create_leagues.js
// and LeaguesController (GET /api/leagues, GET /api/leagues/:id).

import type { League } from "./types"

// UI-only field (flag emoji), not returned by the backend — kept for Sidebar.tsx.
// export type LeagueWithFlag = League & { flag: string }

export const leagues: League[] = [
  {
    id: 1,
    name: "Ekstraklasa",
    country: "Poland",
    slug: "ekstraklasa",
    active: true,
    created_at: "2026-01-05T10:00:00.000Z",
    updated_at: "2026-01-05T10:00:00.000Z",
  },
  {
    id: 2,
    name: "LaLiga",
    country: "Spain",
    slug: "laliga",
    active: true,
    created_at: "2026-01-05T10:00:00.000Z",
    updated_at: "2026-01-05T10:00:00.000Z",
  },
  {
    id: 3,
    name: "Premier League",
    country: "England",
    slug: "premier-league",
    active: true,
    created_at: "2026-01-05T10:00:00.000Z",
    updated_at: "2026-01-05T10:00:00.000Z",
  },
  {
    id: 4,
    name: "Bundesliga",
    country: "Germany",
    slug: "bundesliga",
    active: true,
    created_at: "2026-01-05T10:00:00.000Z",
    updated_at: "2026-01-05T10:00:00.000Z",
  },
]
