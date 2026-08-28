import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { getLeagues } from "@/services/leaguesService";
import type { League } from "@/data/types";
import { getLeagueCountryCode } from "@/lib/leagueLabel";

import { Star, Trophy } from "lucide-react";

const LeaguesAside = () => {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<League[]>([]);

  useEffect(() => {
    getLeagues().then((res) => setLeagues(res.data));
  }, []);

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Trophy className="h-4 w-4 text-primary" />
        Ligi
      </h3>
      <ul className="flex flex-col gap-1">
        {leagues.map((league) => (
          <li key={league.id}>
            <button
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium hover:cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => navigate(`/league/${league.id}`)}
            >
              <span className="flex h-6 w-9 shrink-0 items-center justify-center rounded-md bg-accent/50 text-[10px] font-semibold tracking-wide text-muted-foreground">
                {getLeagueCountryCode(league)}
              </span>
              <span>{league.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FavouriteTeams = () => {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Star className="h-4 w-4 text-primary" />
        Ulubione drużyny
      </h3>
      <p className="text-sm text-muted-foreground text-center">Brak ulubionych drużyn</p>
      {/* TODO: */}
    </div>
  );
};

const Sidebar = () => {
  return (
    // Ligi
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col gap-4 overflow-y-auto p-4 lg:flex xl:w-80">
      <FavouriteTeams />
      <LeaguesAside />
    </aside>
  );
};

export default Sidebar;
