import { CloudLightning } from "lucide-react";

import type { TeamWeatherScores, WeatherCategoryScore } from "@/data/types";
import { difficultConditionsText } from "@/lib/weatherProfile";
import { weatherScoreLabel } from "@/lib/weatherScore";
import { weatherScoreColor } from "@/lib/weatherStylesConfig";

interface OverallWeatherScoreProps {
  overall: NonNullable<TeamWeatherScores["scores"]["overall"]>;
}

const formatPoints = (value: number | null | undefined) =>
  value === null || value === undefined
    ? "—"
    : value.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const record = (score: WeatherCategoryScore) =>
  `${score.wins ?? 0}W · ${score.draws ?? 0}R · ${score.losses ?? 0}P`;

// zbiorczy weather score: trudna pogoda na tle pozostałych meczów (backend: czynnik "overall")
const OverallWeatherScore = ({ overall }: OverallWeatherScoreProps) => {
  const { difficult, normal } = overall;
  if (!difficult) return null;

  const color = weatherScoreColor(difficult.score);

  return (
    <section className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-medium">
            <CloudLightning className="h-4 w-4 shrink-0 text-primary" />
            Trudna pogoda
          </p>
          <p className="text-xs text-muted-foreground first-letter:uppercase">
            {difficultConditionsText}
          </p>
        </div>
        <span className={`text-3xl leading-none font-bold tabular-nums ${color}`}>
          {difficult.score}
        </span>
      </div>

      <p className={`text-xs font-medium ${color}`}>
        {difficult.matches_count === 0 ? "Brak meczów w trudnej pogodzie" : weatherScoreLabel(difficult.score)}
      </p>

      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Trudna · {difficult.matches_count} meczów</dt>
          <dd className="tabular-nums">
            {formatPoints(difficult.avg_points)} pkt/mecz · {record(difficult)}
          </dd>
        </div>
        {normal && (
          <div>
            <dt className="text-muted-foreground">Normalna · {normal.matches_count} meczów</dt>
            <dd className="tabular-nums">
              {formatPoints(normal.avg_points)} pkt/mecz · {record(normal)}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
};

export default OverallWeatherScore;
