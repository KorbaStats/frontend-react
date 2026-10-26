import { useQuery } from "@tanstack/react-query";

import type { League, Stadium, Team } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import { useAuth } from "@/hooks/useAuth";
import { leaguesOptions, matchesOptions, stadiumsOptions, teamsOptions } from "@/hooks/queries";
import { useDeleteTeam, useSaveTeam } from "@/hooks/useAdminMutations";
import { hasPermission } from "@/lib/adminAccess";

import TeamsCard from "@/components/admin/data/TeamsCard";

const EMPTY_LEAGUES: League[] = [];
const EMPTY_TEAMS: Team[] = [];
const EMPTY_STADIUMS: Stadium[] = [];
const EMPTY_MATCHES: MatchWithWeather[] = [];

const AdminTeams = () => {
  const { user } = useAuth();
  const canPickStadium = hasPermission(user, "stadiums");

  const teamsQuery = useQuery(teamsOptions);
  const leaguesQuery = useQuery(leaguesOptions);
  const matchesQuery = useQuery(matchesOptions);
  const stadiumsQuery = useQuery({ ...stadiumsOptions, enabled: canPickStadium });

  const saveTeam = useSaveTeam();
  const deleteTeam = useDeleteTeam();

  const queries = [teamsQuery, leaguesQuery, matchesQuery];

  return (
    <TeamsCard
      teams={teamsQuery.data ?? EMPTY_TEAMS}
      leagues={leaguesQuery.data ?? EMPTY_LEAGUES}
      stadiums={stadiumsQuery.data ?? EMPTY_STADIUMS}
      matches={matchesQuery.data ?? EMPTY_MATCHES}
      canPickStadium={canPickStadium && stadiumsQuery.isSuccess}
      isPending={queries.some((query) => query.isPending)}
      isError={queries.some((query) => query.isError)}
      saveTeam={saveTeam}
      deleteTeam={deleteTeam}
    />
  );
};

export default AdminTeams;
