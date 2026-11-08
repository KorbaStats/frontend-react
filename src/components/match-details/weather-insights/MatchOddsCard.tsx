import { CircleDollarSign } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { impliedShares, matchOdds } from "@/lib/matchOutcomes";
import { formatNumber } from "@/lib/weatherFormat";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SegmentedBar from "@/components/shared/SegmentedBar";

const outcomeStyles = {
  home: "bg-primary text-primary-foreground",
  draw: "bg-muted text-foreground",
  away: "bg-(--weather-clear) text-black",
};

type OutcomeKey = keyof typeof outcomeStyles;

const MatchOddsCard = ({ match }: { match: MatchWithWeather }) => {
  const odds = matchOdds(match);
  const shares = odds && impliedShares(odds);

  const outcomes: { key: OutcomeKey; label: string }[] = [
    { key: "home", label: match.homeTeam.name },
    { key: "draw", label: "Remis" },
    { key: "away", label: match.awayTeam.name },
  ];

  const actual: OutcomeKey =
    match.home_goals === match.away_goals
      ? "draw"
      : match.home_goals > match.away_goals
        ? "home"
        : "away";
  const actualLabel =
    actual === "draw"
      ? "remis"
      : `wygrana: ${actual === "home" ? match.homeTeam.name : match.awayTeam.name}`;

  return (
    <Card className="break-inside-avoid">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CircleDollarSign className="h-4 w-4 text-primary" />
          Szanse według kursów
        </CardTitle>
        <CardDescription>
          Jak bukmacherzy oceniali ten mecz przed pierwszym gwizdkiem.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        {!odds || !shares ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Brak kursów dla tego meczu.
          </p>
        ) : (
          <>
            <SegmentedBar
              heightClassName="h-9"
              segments={outcomes.map(({ key }) => ({
                key,
                pct: shares[key],
                className: outcomeStyles[key],
              }))}
            />

            <div className="flex flex-1 flex-col divide-y *:flex-1">
              {outcomes.map(({ key, label }) => (
                <div
                  key={key}
                  className="grid grid-cols-[minmax(0,1fr)_auto_3rem] items-center gap-3 py-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={`h-3 w-3 shrink-0 rounded-[3px] ${outcomeStyles[key]}`}
                    />
                    <span className="truncate font-medium">{label}</span>
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    kurs {formatNumber(odds[key], 2)}
                  </span>
                  <span className="text-right font-semibold tabular-nums">
                    {Math.round(shares[key])}%
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                Wynik {match.home_goals}:{match.away_goals} ({actualLabel}). Kursy dawały
                na to{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {Math.round(shares[actual])}%
                </span>
                .
              </p>
              <p className="text-xs text-muted-foreground">
                Szansa z kursu to 1/kurs, przeskalowane tak, żeby trzy wyniki dawały 100%.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchOddsCard;
