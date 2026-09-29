import { Link } from "react-router";
import { CloudLightning, type LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { TeamWeatherScore } from "@/lib/leagueWeather";
import { weatherScoreColor } from "@/lib/weatherConfig";
import { weatherScoreLabel } from "@/lib/weatherScore";

interface WeatherScoreRankingCardProps {
  Icon?: LucideIcon;
  iconColor?: string;
  scores: TeamWeatherScore[];
  title: string;
  description: string;
}

const WeatherScoreRankingCard = ({
  Icon = CloudLightning,
  iconColor = 'text-primary',
  scores,
  title,
  description,
}: WeatherScoreRankingCardProps) => (
  <Card className="break-inside-avoid">
    <CardHeader className="border-b pb-6">
      <CardTitle className="flex items-center gap-2 text-base">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>

    <CardContent className="px-0">
      {scores.length === 0 ? (
        <p className="px-6 py-4 text-center text-sm text-muted-foreground">
          Za mało meczów w trudnej lub normalnej pogodzie, żeby policzyć
          wskaźnik.
        </p>
      ) : (
        <ol className="divide-y">
          {scores.map(({ team, score }, idx) => (
            <li key={team.id} className="flex items-center gap-3 px-6 py-3">
              <span className="w-4 shrink-0 text-center text-sm tabular-nums text-muted-foreground">
                {idx + 1}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-secondary/20 text-[10px] font-extrabold">
                {team.short_name}
              </span>

              <div className="flex min-w-0 flex-col leading-tight">
                <Link
                  to={`/team/${team.id}`}
                  className="truncate font-medium text-foreground hover:text-primary"
                >
                  {team.name}
                </Link>
                <span className="hidden truncate text-xs text-muted-foreground xl:inline">
                  {weatherScoreLabel(score.score)}
                </span>
              </div>

              <div className="ml-auto flex flex-col items-end leading-tight">
                <span
                  className={`text-lg font-bold tabular-nums ${weatherScoreColor(score.score)}`}
                >
                  {score.score}
                </span>
                <span className="hidden text-xs tabular-nums text-muted-foreground lg:inline">
                  {score.difference > 0 ? "+" : ""}
                  {score.difference.toFixed(2)} pkt/mecz
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </CardContent>
  </Card>
);

export default WeatherScoreRankingCard;
