import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Star, Trophy } from "lucide-react";

import { getLeagues } from "@/services/leaguesService";
import type { League } from "@/data/types";
import { getLeagueCountryCode } from "@/lib/leagueLabel";
import SidebarSection from "@/components/layout/sidebar-type/SidebarSection";

const NavSidebar = () => {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<League[]>([]);

  useEffect(() => {
    getLeagues().then((res) => setLeagues(res.data));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <SidebarSection icon={Star} title="Ulubione drużyny">
        <p className="px-2 py-1 text-sm text-muted-foreground">
          Brak ulubionych drużyn
        </p>
        {/* TODO: logika i UI dodawania do ulubionych */}
      </SidebarSection>

      <SidebarSection icon={Trophy} title="Ligi">
        <ul className="flex flex-col gap-1">
          {leagues.map((league) => (
            <li key={league.id}>
              <button
                className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => navigate(`/league/${league.id}`)}
              >
                <span className="flex h-6 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-accent text-[11px] font-semibold tracking-wide text-foreground transition-colors">
                  {getLeagueCountryCode(league)}
                </span>
                <span>{league.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </SidebarSection>
    </div>
  );
};

export default NavSidebar;
