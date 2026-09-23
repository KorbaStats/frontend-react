// Dane zamockowane — do podmiany na endpointy backendu.
// Kształt zweryfikowany z migracją 20260525140000_create_teams_table.js
// i z TeamsController (GET /api/teams, GET /api/teams/:id) — oba endpointy
// używają withGraphFetched("[league, homeStadium]"), co zwraca pełne wiersze
// (jsonSchema waliduje tylko zapisy, żaden kontroler nie ogranicza kolumn w
// SELECT), więc zagnieżdżone `league`/`homeStadium` niosą każdą kolumnę
// League/Stadium.

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

// Pełne składy lig: Ekstraklasa i Bundesliga po 18 drużyn, LaLiga i Premier
// League po 20. matches.ts buduje z tego rundę i rewanż, czyli 306 albo 380 par
// na ligę na sezon (34 lub 38 meczów na drużynę) — tyle, żeby najrzadsze warunki
// pogodowe miały używalną próbę, a tabela ligowa wyglądała jak prawdziwa.
// home_stadium_id == id drużyny, patrz stadiums.ts.
const teamSeeds: TeamSeed[] = [
  // Ekstraklasa (18)
  { id: 1, name: "Legia Warszawa", short_name: "LEG", city: "Warsaw", country: "Poland", league_id: 1, home_stadium_id: 1 },
  { id: 2, name: "Lech Poznań", short_name: "LECH", city: "Poznań", country: "Poland", league_id: 1, home_stadium_id: 2 },
  { id: 11, name: "Raków Częstochowa", short_name: "RAK", city: "Częstochowa", country: "Poland", league_id: 1, home_stadium_id: 11 },
  { id: 12, name: "Pogoń Szczecin", short_name: "POG", city: "Szczecin", country: "Poland", league_id: 1, home_stadium_id: 12 },
  { id: 13, name: "Jagiellonia Białystok", short_name: "JAG", city: "Białystok", country: "Poland", league_id: 1, home_stadium_id: 13 },
  { id: 14, name: "Górnik Zabrze", short_name: "GOR", city: "Zabrze", country: "Poland", league_id: 1, home_stadium_id: 14 },
  { id: 25, name: "Cracovia", short_name: "CRA", city: "Kraków", country: "Poland", league_id: 1, home_stadium_id: 25 },
  { id: 26, name: "Widzew Łódź", short_name: "WID", city: "Łódź", country: "Poland", league_id: 1, home_stadium_id: 26 },
  { id: 33, name: "Śląsk Wrocław", short_name: "SLA", city: "Wrocław", country: "Poland", league_id: 1, home_stadium_id: 33 },
  { id: 34, name: "Lechia Gdańsk", short_name: "LGD", city: "Gdańsk", country: "Poland", league_id: 1, home_stadium_id: 34 },
  { id: 35, name: "Piast Gliwice", short_name: "PIA", city: "Gliwice", country: "Poland", league_id: 1, home_stadium_id: 35 },
  { id: 36, name: "Zagłębie Lubin", short_name: "ZAG", city: "Lubin", country: "Poland", league_id: 1, home_stadium_id: 36 },
  { id: 37, name: "Radomiak Radom", short_name: "RAD", city: "Radom", country: "Poland", league_id: 1, home_stadium_id: 37 },
  { id: 38, name: "Korona Kielce", short_name: "KOR", city: "Kielce", country: "Poland", league_id: 1, home_stadium_id: 38 },
  { id: 39, name: "Motor Lublin", short_name: "MOT", city: "Lublin", country: "Poland", league_id: 1, home_stadium_id: 39 },
  { id: 40, name: "Stal Mielec", short_name: "STA", city: "Mielec", country: "Poland", league_id: 1, home_stadium_id: 40 },
  { id: 41, name: "GKS Katowice", short_name: "GKS", city: "Katowice", country: "Poland", league_id: 1, home_stadium_id: 41 },
  { id: 42, name: "Puszcza Niepołomice", short_name: "PUS", city: "Niepołomice", country: "Poland", league_id: 1, home_stadium_id: 42 },

  // LaLiga (20)
  { id: 3, name: "Real Madrid", short_name: "RMA", city: "Madrid", country: "Spain", league_id: 2, home_stadium_id: 3 },
  { id: 4, name: "FC Barcelona", short_name: "FCB", city: "Barcelona", country: "Spain", league_id: 2, home_stadium_id: 4 },
  { id: 5, name: "Atlético Madrid", short_name: "ATM", city: "Madrid", country: "Spain", league_id: 2, home_stadium_id: 5 },
  { id: 15, name: "Sevilla FC", short_name: "SEV", city: "Sevilla", country: "Spain", league_id: 2, home_stadium_id: 15 },
  { id: 16, name: "Valencia CF", short_name: "VAL", city: "Valencia", country: "Spain", league_id: 2, home_stadium_id: 16 },
  { id: 17, name: "Real Sociedad", short_name: "RSO", city: "San Sebastián", country: "Spain", league_id: 2, home_stadium_id: 17 },
  { id: 27, name: "Athletic Bilbao", short_name: "ATH", city: "Bilbao", country: "Spain", league_id: 2, home_stadium_id: 27 },
  { id: 28, name: "Villarreal CF", short_name: "VIL", city: "Villarreal", country: "Spain", league_id: 2, home_stadium_id: 28 },
  { id: 43, name: "Real Betis", short_name: "BET", city: "Sevilla", country: "Spain", league_id: 2, home_stadium_id: 43 },
  { id: 44, name: "Celta Vigo", short_name: "CEL", city: "Vigo", country: "Spain", league_id: 2, home_stadium_id: 44 },
  { id: 45, name: "Girona FC", short_name: "GIR", city: "Girona", country: "Spain", league_id: 2, home_stadium_id: 45 },
  { id: 46, name: "Rayo Vallecano", short_name: "RAY", city: "Madrid", country: "Spain", league_id: 2, home_stadium_id: 46 },
  { id: 47, name: "CA Osasuna", short_name: "OSA", city: "Pamplona", country: "Spain", league_id: 2, home_stadium_id: 47 },
  { id: 48, name: "Getafe CF", short_name: "GET", city: "Getafe", country: "Spain", league_id: 2, home_stadium_id: 48 },
  { id: 49, name: "RCD Mallorca", short_name: "MLL", city: "Palma", country: "Spain", league_id: 2, home_stadium_id: 49 },
  { id: 50, name: "Deportivo Alavés", short_name: "ALA", city: "Vitoria-Gasteiz", country: "Spain", league_id: 2, home_stadium_id: 50 },
  { id: 51, name: "RCD Espanyol", short_name: "ESP", city: "Barcelona", country: "Spain", league_id: 2, home_stadium_id: 51 },
  { id: 52, name: "Real Valladolid", short_name: "VLL", city: "Valladolid", country: "Spain", league_id: 2, home_stadium_id: 52 },
  { id: 53, name: "UD Las Palmas", short_name: "LPA", city: "Las Palmas", country: "Spain", league_id: 2, home_stadium_id: 53 },
  { id: 54, name: "CD Leganés", short_name: "LEA", city: "Leganés", country: "Spain", league_id: 2, home_stadium_id: 54 },

  // Premier League (20)
  { id: 6, name: "Arsenal", short_name: "ARS", city: "London", country: "England", league_id: 3, home_stadium_id: 6 },
  { id: 7, name: "Liverpool", short_name: "LIV", city: "Liverpool", country: "England", league_id: 3, home_stadium_id: 7 },
  { id: 8, name: "Manchester City", short_name: "MCI", city: "Manchester", country: "England", league_id: 3, home_stadium_id: 8 },
  { id: 18, name: "Manchester United", short_name: "MUN", city: "Manchester", country: "England", league_id: 3, home_stadium_id: 18 },
  { id: 19, name: "Chelsea", short_name: "CHE", city: "London", country: "England", league_id: 3, home_stadium_id: 19 },
  { id: 20, name: "Newcastle United", short_name: "NEW", city: "Newcastle", country: "England", league_id: 3, home_stadium_id: 20 },
  { id: 29, name: "Tottenham Hotspur", short_name: "TOT", city: "London", country: "England", league_id: 3, home_stadium_id: 29 },
  { id: 30, name: "Aston Villa", short_name: "AVL", city: "Birmingham", country: "England", league_id: 3, home_stadium_id: 30 },
  { id: 55, name: "Brighton & Hove Albion", short_name: "BHA", city: "Brighton", country: "England", league_id: 3, home_stadium_id: 55 },
  { id: 56, name: "West Ham United", short_name: "WHU", city: "London", country: "England", league_id: 3, home_stadium_id: 56 },
  { id: 57, name: "Everton", short_name: "EVE", city: "Liverpool", country: "England", league_id: 3, home_stadium_id: 57 },
  { id: 58, name: "Crystal Palace", short_name: "CRY", city: "London", country: "England", league_id: 3, home_stadium_id: 58 },
  { id: 59, name: "Fulham", short_name: "FUL", city: "London", country: "England", league_id: 3, home_stadium_id: 59 },
  { id: 60, name: "Brentford", short_name: "BRE", city: "London", country: "England", league_id: 3, home_stadium_id: 60 },
  { id: 61, name: "Wolverhampton Wanderers", short_name: "WOL", city: "Wolverhampton", country: "England", league_id: 3, home_stadium_id: 61 },
  { id: 62, name: "Nottingham Forest", short_name: "NFO", city: "Nottingham", country: "England", league_id: 3, home_stadium_id: 62 },
  { id: 63, name: "AFC Bournemouth", short_name: "BOU", city: "Bournemouth", country: "England", league_id: 3, home_stadium_id: 63 },
  { id: 64, name: "Leicester City", short_name: "LEI", city: "Leicester", country: "England", league_id: 3, home_stadium_id: 64 },
  { id: 65, name: "Southampton", short_name: "SOU", city: "Southampton", country: "England", league_id: 3, home_stadium_id: 65 },
  { id: 66, name: "Ipswich Town", short_name: "IPS", city: "Ipswich", country: "England", league_id: 3, home_stadium_id: 66 },

  // Bundesliga (18)
  { id: 9, name: "Bayern Munich", short_name: "BAY", city: "Munich", country: "Germany", league_id: 4, home_stadium_id: 9 },
  { id: 10, name: "Borussia Dortmund", short_name: "BVB", city: "Dortmund", country: "Germany", league_id: 4, home_stadium_id: 10 },
  { id: 21, name: "RB Leipzig", short_name: "RBL", city: "Leipzig", country: "Germany", league_id: 4, home_stadium_id: 21 },
  { id: 22, name: "Bayer Leverkusen", short_name: "B04", city: "Leverkusen", country: "Germany", league_id: 4, home_stadium_id: 22 },
  { id: 23, name: "Eintracht Frankfurt", short_name: "SGE", city: "Frankfurt", country: "Germany", league_id: 4, home_stadium_id: 23 },
  { id: 24, name: "VfB Stuttgart", short_name: "VFB", city: "Stuttgart", country: "Germany", league_id: 4, home_stadium_id: 24 },
  { id: 31, name: "Werder Bremen", short_name: "SVW", city: "Bremen", country: "Germany", league_id: 4, home_stadium_id: 31 },
  { id: 32, name: "VfL Wolfsburg", short_name: "WOB", city: "Wolfsburg", country: "Germany", league_id: 4, home_stadium_id: 32 },
  { id: 67, name: "Borussia Mönchengladbach", short_name: "BMG", city: "Mönchengladbach", country: "Germany", league_id: 4, home_stadium_id: 67 },
  { id: 68, name: "1. FC Union Berlin", short_name: "FCU", city: "Berlin", country: "Germany", league_id: 4, home_stadium_id: 68 },
  { id: 69, name: "SC Freiburg", short_name: "SCF", city: "Freiburg", country: "Germany", league_id: 4, home_stadium_id: 69 },
  { id: 70, name: "TSG Hoffenheim", short_name: "TSG", city: "Sinsheim", country: "Germany", league_id: 4, home_stadium_id: 70 },
  { id: 71, name: "1. FSV Mainz 05", short_name: "M05", city: "Mainz", country: "Germany", league_id: 4, home_stadium_id: 71 },
  { id: 72, name: "FC Augsburg", short_name: "FCA", city: "Augsburg", country: "Germany", league_id: 4, home_stadium_id: 72 },
  { id: 73, name: "VfL Bochum", short_name: "BOC", city: "Bochum", country: "Germany", league_id: 4, home_stadium_id: 73 },
  { id: 74, name: "1. FC Heidenheim", short_name: "FCH", city: "Heidenheim", country: "Germany", league_id: 4, home_stadium_id: 74 },
  { id: 75, name: "FC St. Pauli", short_name: "STP", city: "Hamburg", country: "Germany", league_id: 4, home_stadium_id: 75 },
  { id: 76, name: "Holstein Kiel", short_name: "KSV", city: "Kiel", country: "Germany", league_id: 4, home_stadium_id: 76 },
]

export const teams: Team[] = teamSeeds.map((seed) => ({
  ...seed,
  created_at: "2026-01-15T09:00:00.000Z",
  updated_at: "2026-01-15T09:00:00.000Z",
  league: findLeague(seed.league_id),
  homeStadium: findStadium(seed.home_stadium_id),
}))
