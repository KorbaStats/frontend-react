import { Link } from "react-router";

import { weatherScoreLabel, type RankedWeatherScore } from "@/lib/weatherScore";
import { weatherScoreColor } from "@/lib/weatherStylesConfig";
import { getTeamShortName } from "@/lib/teamLabel";

interface WeatherScoreRankingListProps {
  rows: RankedWeatherScore[];
  showScoreBar?: boolean;
}

const WeatherScoreRankingList = ({
  rows,
  showScoreBar = false,
}: WeatherScoreRankingListProps) => (
  <ol className="divide-y">
    {rows.map(({ team, score }, idx) => (
      <li key={team.id} className="flex items-center gap-3 px-4 py-2">
        <span className="w-4 shrink-0 text-center text-sm tabular-nums text-muted-foreground">
          {idx + 1}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-secondary/20 text-[10px] font-extrabold">
          {getTeamShortName(team)}
        </span>

        <div className="flex min-w-0 flex-col leading-tight">
          <Link
            to={`/team/${team.id}`}
            className="truncate font-medium text-foreground hover:text-primary"
          >
            {team.name}
          </Link>
          <span className="hidden truncate text-xs text-muted-foreground @sm:inline">
            {weatherScoreLabel(score.score)}
          </span>
        </div>

        {showScoreBar && (
          <div
            aria-hidden
            className={`hidden min-w-12 flex-1 @sm:block ${weatherScoreColor(score.score)}`}
          >
            <div className="relative h-2 rounded-full bg-muted">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-current"
                style={{ width: `${score.score}%` }}
              />
              <span className="absolute -inset-y-0.5 left-1/2 w-px bg-foreground/50" />
            </div>
          </div>
        )}

        <div className="ml-auto flex shrink-0 flex-col items-end leading-tight">
          <span
            className={`text-lg font-bold tabular-nums ${weatherScoreColor(score.score)}`}
          >
            {score.score}
          </span>
          <span className="hidden text-xs tabular-nums text-muted-foreground @sm:inline">
            meczów: {score.matches_count}
          </span>
        </div>
      </li>
    ))}
  </ol>
);

export default WeatherScoreRankingList;
