// Mocked data - change later for backend endpoints
// Shape verified against backend migration 20260525140000_create_teams_table.js
// and TeamsController (GET /api/teams, GET /api/teams/:id) — both endpoints
// use withGraphFetched("[league, homeStadium]"), which returns full rows
// (jsonSchema only validates writes, no controller restricts SELECT columns),
// so nested `league`/`homeStadium` carry every League/Stadium column.

import { leagues } from "./leagues"
import { stadiums } from "./stadiums"
import type { League, Stadium, Team } from "./types"

function findLeague(leagueId: number): League {
  const { id, name, country, slug, active, created_at, updated_at } = leagues.find(
    (l) => l.id === leagueId,
  )!
  return { id, name, country, slug, active, created_at, updated_at }
}

function findStadium(stadiumId: number): Stadium {
  return stadiums.find((s) => s.id === stadiumId)!
}

type TeamSeed = {
  id: number
  name: string
  short_name: string
  city: string
  country: string
  league_id: number
  home_stadium_id: number
}

const teamSeeds: TeamSeed[] = [
  { id: 1, name: "Legia Warszawa", short_name: "LEG", city: "Warsaw", country: "Poland", league_id: 1, home_stadium_id: 1 },
  { id: 2, name: "Lech Poznań", short_name: "LECH", city: "Poznań", country: "Poland", league_id: 1, home_stadium_id: 2 },
  { id: 3, name: "Real Madrid", short_name: "RMA", city: "Madrid", country: "Spain", league_id: 2, home_stadium_id: 3 },
  { id: 4, name: "FC Barcelona", short_name: "FCB", city: "Barcelona", country: "Spain", league_id: 2, home_stadium_id: 4 },
  { id: 5, name: "Atlético Madrid", short_name: "ATM", city: "Madrid", country: "Spain", league_id: 2, home_stadium_id: 5 },
  { id: 6, name: "Arsenal", short_name: "ARS", city: "London", country: "England", league_id: 3, home_stadium_id: 6 },
  { id: 7, name: "Liverpool", short_name: "LIV", city: "Liverpool", country: "England", league_id: 3, home_stadium_id: 7 },
  { id: 8, name: "Manchester City", short_name: "MCI", city: "Manchester", country: "England", league_id: 3, home_stadium_id: 8 },
  { id: 9, name: "Bayern Munich", short_name: "BAY", city: "Munich", country: "Germany", league_id: 4, home_stadium_id: 9 },
  { id: 10, name: "Borussia Dortmund", short_name: "BVB", city: "Dortmund", country: "Germany", league_id: 4, home_stadium_id: 10 },
]

export const teams: Team[] = teamSeeds.map((seed) => ({
  ...seed,
  created_at: "2026-01-15T09:00:00.000Z",
  updated_at: "2026-01-15T09:00:00.000Z",
  league: findLeague(seed.league_id),
  homeStadium: findStadium(seed.home_stadium_id),
}))
