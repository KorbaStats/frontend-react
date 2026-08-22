import { Card } from "@/components/ui/card";
import type { Team } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import { MapPin, Users } from "lucide-react";
import TeamLogo from "../shared/TeamLogo";
import ResultBadge from "../shared/ResultBadge";

interface TeamInfoProps {
  matches: MatchWithWeather[];
  team: Team | undefined;
}

const TeamInfoCard = ({ matches, team }: TeamInfoProps) => {
  return (
    <Card className="flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Image / short name */}
      <div className="flex items-center gap-4">
        <TeamLogo name={team?.name} short_name={team?.short_name} />
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
        <p className="text-sm text-muted-foreground/80 self-start">
          Ostatnie mecze
        </p>
        <ol className="flex gap-1.5">
          {matches.slice(0, 5).map((m) => {
            const isHome = m.home_team_id === team?.id;

            return (
              <li key={m.id}>
                <ResultBadge
                  goalsFor={isHome ? m.home_goals : m.away_goals}
                  goalsAgainst={isHome ? m.away_goals : m.home_goals}
                />
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
};

export default TeamInfoCard;
