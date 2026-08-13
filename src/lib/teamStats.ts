import type { MatchWithWeather } from "@/services/matchesService";

// Field names mirror TeamRanking (types.ts) on purpose — TeamStatsController.rankings
// already computes the same averages server-side via the same home/away UNION ALL
// pattern. Same names now means swapping this for a real endpoint later touches
// only the fetch, not every component reading these fields.
export type TeamStats = {
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  avg_goals_scored: number | null;
  avg_goals_conceded: number | null;
  avg_xg: number | null;
  avg_possession: number | null;
  avg_shots: number | null;
  avg_shots_on_target: number | null;
  avg_yellow_cards: number | null;
  avg_fouls: number | null;
  win_rate: number | null; // 0-100, no backend equivalent — ours to define
};

export type MatchFromTeamPerspective = {
  goalsFor: number;
  goalsAgainst: number;
  xg: number;
  shots: number;
  shotsOnTarget: number;
  possession: number;
  yellowCards: number;
  fouls: number;
  result: "W" | "D" | "L";
};

export function getMatchFromTeamPerspective(
  match: MatchWithWeather,
  teamId: number,
): MatchFromTeamPerspective {
  const isHome = match.home_team_id === teamId;

  const goalsFor = isHome ? match.home_goals : match.away_goals;
  const goalsAgainst = isHome ? match.away_goals : match.home_goals;
  const result: "W" | "D" | "L" =
    goalsFor === goalsAgainst ? "D" : goalsFor > goalsAgainst ? "W" : "L";

  return {
    goalsFor,
    goalsAgainst,
    xg: isHome ? match.home_expected_goals_xg : match.away_expected_goals_xg,
    shots: isHome ? match.home_total_shots : match.away_total_shots,
    shotsOnTarget: isHome
      ? match.home_shots_on_target
      : match.away_shots_on_target,
    possession: isHome
      ? match.home_ball_possession
      : match.away_ball_possession,
    yellowCards: isHome ? match.home_yellow_cards : match.away_yellow_cards,
    fouls: isHome ? match.home_fouls : match.away_fouls,
    result,
  };
}

export function computeTeamStats(
  matches: MatchWithWeather[],
  teamId: number,
): TeamStats {
  if (matches.length === 0) {
    return {
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_scored: 0,
      goals_conceded: 0,
      avg_goals_scored: null,
      avg_goals_conceded: null,
      avg_xg: null,
      avg_possession: null,
      avg_shots: null,
      avg_shots_on_target: null,
      avg_yellow_cards: null,
      avg_fouls: null,
      win_rate: null,
    };
  }

  const perspectives = matches.map((m) => getMatchFromTeamPerspective(m, teamId))

  const goals_scored = perspectives.reduce((acc, el) => acc + el.goalsFor, 0);
  const goals_conceded = perspectives.reduce((acc, el) => acc + el.goalsAgainst, 0);
  const wins = perspectives.filter(p => p.result === "W").length;
  const draws = perspectives.filter(p => p.result === "D").length;
  const losses = perspectives.filter(p => p.result === "L").length;

  return {
    matches: perspectives.length,
    wins,
    draws,
    losses,
    goals_scored,
    goals_conceded,
    avg_goals_scored: (goals_scored / perspectives.length),
    avg_goals_conceded: goals_conceded / perspectives.length,
    avg_xg: perspectives.reduce((acc, el) => acc + el.xg, 0) / perspectives.length,
    avg_possession: perspectives.reduce((acc, el) => acc + el.possession, 0) / perspectives.length,
    avg_shots: perspectives.reduce((acc, el) => acc + el.shots, 0) / perspectives.length,
    avg_shots_on_target: perspectives.reduce((acc, el) => acc + el.shotsOnTarget, 0) / perspectives.length,
    avg_yellow_cards: perspectives.reduce((acc, el) => acc + el.yellowCards, 0) / perspectives.length,
    avg_fouls: perspectives.reduce((acc, el) => acc + el.fouls, 0) / perspectives.length,
    win_rate: (wins / perspectives.length) * 100
  };
}
