import type { Team, Match } from "@/data/types"

export type StandingRow = {
  team: Team,
  played: number, won: number, drawn: number, lost: number,
  goalsFor: number, goalsAgainst: number,
  goalDiff: number,
  points: number,
  form: ("W" | "D" | "L")[] //the last 5 matches
}

// helpers functions for computeStandings
function getOrCreateRow(map: Map<number, StandingRow>, team: Team): StandingRow {
  let row = map.get(team.id);
  if (!row) {
    row = {
      team: team,
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0,
      goalDiff: 0, points: 0,
      form: [],
    }
    map.set(team.id, row);
  }
  return row;
}

function applyResult(row: StandingRow, goalsFor: number, goalsAgainst: number) {
  let result: "W" | "L" | "D"
  row.played++;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDiff += goalsFor - goalsAgainst

  if (goalsFor > goalsAgainst) {
    row.won++;
    row.points+=3;
    result = "W"
  } else if (goalsFor < goalsAgainst) {
    row.lost++;
    result = "L"
  } else {
    row.drawn++;
    row.points+=1;
    result = "D"
  }

  if (row.form.length < 5) {
    (row.form).push(result)
  }
}

// oczekuje mecze od najnowszych (forma = pierwsze 5 meczy)
export function computeStandings(matches: Match[]): StandingRow[] {
  const standingsMap = new Map<number, StandingRow>()

  for (const match of matches) {
    const homeRow = getOrCreateRow(standingsMap, match.homeTeam);
    const awayRow = getOrCreateRow(standingsMap, match.awayTeam);
    
    applyResult(homeRow, match.home_goals, match.away_goals);
    applyResult(awayRow, match.away_goals, match.home_goals);
  }
  
  const standings = [...standingsMap.values()].sort((a,b) => b.points - a.points);
  return standings;
}