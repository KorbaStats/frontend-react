import type { Match, Team, TeamRanking } from "@/data/types";

type FormResult = "W" | "D" | "L";

export type StandingRow = {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: FormResult[];
};

const FORM_LENGTH = 5;

function resultFor(goalsFor: number, goalsAgainst: number): FormResult {
  if (goalsFor > goalsAgainst) return "W";
  if (goalsFor < goalsAgainst) return "L";
  return "D";
}

function computeForm(matches: Match[]): Map<number, FormResult[]> {
  const form = new Map<number, FormResult[]>();

  const push = (teamId: number, result: FormResult) => {
    const results = form.get(teamId) ?? [];
    if (results.length < FORM_LENGTH) results.push(result);
    form.set(teamId, results);
  };

  for (const match of matches) {
    push(match.home_team_id, resultFor(match.home_goals, match.away_goals));
    push(match.away_team_id, resultFor(match.away_goals, match.home_goals));
  }

  return form;
}

export function buildStandings(
  rankings: TeamRanking[],
  teams: Team[],
  newestFirstMatches: Match[],
): StandingRow[] {
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const form = computeForm(newestFirstMatches);

  return rankings
    .flatMap((ranking) => {
      const team = teamsById.get(ranking.team_id);
      if (!team) return [];

      return [
        {
          team,
          played: ranking.matches,
          won: ranking.wins,
          drawn: ranking.draws,
          lost: ranking.losses,
          goalsFor: ranking.goals_scored,
          goalsAgainst: ranking.goals_conceded,
          goalDiff: ranking.goals_scored - ranking.goals_conceded,
          points: ranking.points,
          form: form.get(ranking.team_id) ?? [],
        },
      ];
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDiff - a.goalDiff ||
        b.goalsFor - a.goalsFor,
    );
}
