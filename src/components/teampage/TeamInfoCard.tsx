import { Card } from "@/components/ui/card";
import type { Team } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchStatsService";
import { MapPin, Users } from "lucide-react";

const resultStylesConfig = {
  W: { text: "W", bg: "bg-green-500 dark:bg-green-500/80" },
  D: { text: "D", bg: "bg-amber-300 dark:bg-amber-400/80" },
  L: { text: "L", bg: "bg-red-500 dark:bg-red-500/80" },
};

interface TeamInfoProps {
  matches: MatchWithWeather[];
  team: Team | undefined;
}

const TeamInfoCard = ({ matches, team }: TeamInfoProps) => {
  return (
    <Card className="flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Image / short name */}
      <div className="flex items-center gap-4">
        <div
          role="img"
          aria-label={team?.name}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-secondary/20"
        >
          <span className="text-xl font-extrabold tracking-wide text-foreground">
            {team?.short_name}
          </span>
        </div>

        {/* team info */}
        <div>
          <p className=" text-md text-primary font-bold tracking-widest ">
            {team?.league?.name.toUpperCase()}
          </p>
          <h1 className="mb-1 text-3xl font-bold">{team?.name}</h1>
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <dt className="sr-only">Stadion</dt>
              <MapPin size={16} />
              <dd>
                {team?.homeStadium?.name}, {team?.city}
              </dd>
            </div>
            <div className="flex items-center gap-1">
              <dt className="sr-only">Pojemność stadionu</dt>
              <Users size={16} />
              <dd>{team?.homeStadium?.capacity.toLocaleString("pl-PL")}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Last 5 matches (win / draw / lose) */}
      <div className="flex flex-col gap-2 lg:items-end">
        <p className="text-sm font-bold">Ostatnie mecze:</p>
        <ol className="flex gap-1.5">
          {matches.slice(0, 5).map((m) => {
            const isHome = m.home_team_id === team?.id;

            const ourGoals = isHome ? m.home_goals : m.away_goals;
            const enemyGoals = isHome ? m.away_goals : m.home_goals;

            let result: "W" | "D" | "L";
            if (ourGoals === enemyGoals) {
              result = "D";
            } else if (ourGoals > enemyGoals) {
              result = "W";
            } else {
              result = "L";
            }

            const stylingConfig = resultStylesConfig[result];

            return (
              <li
                key={m.id}
                title={
                  result === "W"
                    ? "Wygrana"
                    : result === "D"
                      ? "Remis"
                      : "Porażka"
                }
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xl font-bold text-white ${stylingConfig.bg}`}
              >
                {stylingConfig.text}
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
};

export default TeamInfoCard;
