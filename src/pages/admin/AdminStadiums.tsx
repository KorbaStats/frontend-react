import { useQuery } from "@tanstack/react-query";

import type { Stadium, Team } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import { getGeocodingStatus } from "@/services/stadiumsService";
import { toUserMessage } from "@/services/http";
import { matchesOptions, stadiumsOptions, teamsOptions } from "@/hooks/queries";
import { useDeleteStadium, useRunGeocoding, useSaveStadium } from "@/hooks/useAdminMutations";

import StadiumsCard from "@/components/admin/data/StadiumsCard";

const EMPTY_STADIUMS: Stadium[] = [];
const EMPTY_TEAMS: Team[] = [];
const EMPTY_MATCHES: MatchWithWeather[] = [];

const AdminStadiums = () => {
  const stadiumsQuery = useQuery(stadiumsOptions);
  const teamsQuery = useQuery(teamsOptions);
  const matchesQuery = useQuery(matchesOptions);

  const saveStadium = useSaveStadium();
  const deleteStadium = useDeleteStadium();
  const geocoding = useRunGeocoding();

  const geocodingStatusQuery = useQuery({
    queryKey: ["stadiums", "geocoding-status"],
    queryFn: getGeocodingStatus,
    refetchInterval: geocoding.isPending ? 1000 : false,
  });

  const queries = [stadiumsQuery, teamsQuery, matchesQuery];

  return (
    <StadiumsCard
      stadiums={stadiumsQuery.data ?? EMPTY_STADIUMS}
      teams={teamsQuery.data ?? EMPTY_TEAMS}
      matches={matchesQuery.data ?? EMPTY_MATCHES}
      isPending={queries.some((query) => query.isPending)}
      isError={queries.some((query) => query.isError)}
      saveStadium={saveStadium}
      deleteStadium={deleteStadium}
      geocodingStatus={geocodingStatusQuery.data}
      isGeocoding={geocoding.isPending}
      geocodingError={geocoding.error ? toUserMessage(geocoding.error) : null}
      onRunGeocoding={() => geocoding.mutate()}
    />
  );
};

export default AdminStadiums;
