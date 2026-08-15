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

// 6 teams per league — matches.ts builds a double round-robin per league per
// season, so this is what decides the size of the mocked match list
// (6 teams => 30 fixtures per league per season).
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
  { id: 11, name: "Raków Częstochowa", short_name: "RAK", city: "Częstochowa", country: "Poland", league_id: 1, home_stadium_id: 11 },
  { id: 12, name: "Pogoń Szczecin", short_name: "POG", city: "Szczecin", country: "Poland", league_id: 1, home_stadium_id: 12 },
  { id: 13, name: "Jagiellonia Białystok", short_name: "JAG", city: "Białystok", country: "Poland", league_id: 1, home_stadium_id: 13 },
  { id: 14, name: "Górnik Zabrze", short_name: "GOR", city: "Zabrze", country: "Poland", league_id: 1, home_stadium_id: 14 },
  { id: 15, name: "Sevilla FC", short_name: "SEV", city: "Sevilla", country: "Spain", league_id: 2, home_stadium_id: 15 },
  { id: 16, name: "Valencia CF", short_name: "VAL", city: "Valencia", country: "Spain", league_id: 2, home_stadium_id: 16 },
  { id: 17, name: "Real Sociedad", short_name: "RSO", city: "San Sebastián", country: "Spain", league_id: 2, home_stadium_id: 17 },
  { id: 18, name: "Manchester United", short_name: "MUN", city: "Manchester", country: "England", league_id: 3, home_stadium_id: 18 },
  { id: 19, name: "Chelsea", short_name: "CHE", city: "London", country: "England", league_id: 3, home_stadium_id: 19 },
  { id: 20, name: "Newcastle United", short_name: "NEW", city: "Newcastle", country: "England", league_id: 3, home_stadium_id: 20 },
  { id: 21, name: "RB Leipzig", short_name: "RBL", city: "Leipzig", country: "Germany", league_id: 4, home_stadium_id: 21 },
  { id: 22, name: "Bayer Leverkusen", short_name: "B04", city: "Leverkusen", country: "Germany", league_id: 4, home_stadium_id: 22 },
  { id: 23, name: "Eintracht Frankfurt", short_name: "SGE", city: "Frankfurt", country: "Germany", league_id: 4, home_stadium_id: 23 },
  { id: 24, name: "VfB Stuttgart", short_name: "VFB", city: "Stuttgart", country: "Germany", league_id: 4, home_stadium_id: 24 },
]

export const teams: Team[] = teamSeeds.map((seed) => ({
  ...seed,
  created_at: "2026-01-15T09:00:00.000Z",
  updated_at: "2026-01-15T09:00:00.000Z",
  league: findLeague(seed.league_id),
  homeStadium: findStadium(seed.home_stadium_id),
}))
