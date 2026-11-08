import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { MatchWithWeather } from "@/services/matchesService";
import type { Team, TeamWeatherScores, WeatherCategoryKey } from "@/data/types";

import {
  matchesOptions,
  teamsOptions,
  weatherScoreCategoriesOptions,
  weatherScoresOptions,
} from "@/hooks/queries";
import {
  DEFAULT_RANKING_CATEGORY,
  categoryLabel,
  rankWeatherScores,
} from "@/lib/weatherScore";

import AttendanceEffectCard from "@/components/dashboard/AttendanceEffectCard";
import DataCoverageStrip from "@/components/dashboard/DataCoverageStrip";
import RecentMatchesCard from "@/components/dashboard/RecentMatchesCard";
import StrongFavouriteCard from "@/components/dashboard/StrongFavouriteCard";
import TeamWeatherEffectCard from "@/components/dashboard/TeamWeatherEffectCard";
import WeatherRecordCards from "@/components/dashboard/WeatherRecordCards";
import WeatherScoreRankings from "@/components/dashboard/WeatherScoreRankings";

const EMPTY_MATCHES: MatchWithWeather[] = [];
const EMPTY_SCORES: TeamWeatherScores[] = [];
const EMPTY_TEAMS: Team[] = [];
const RECENT_LIMIT = 7;

const Dashboard = () => {
  const matchesQuery = useQuery(matchesOptions);
  const weatherScoresQuery = useQuery(weatherScoresOptions);
  const teamsQuery = useQuery(teamsOptions);
  const categoriesQuery = useQuery(weatherScoreCategoriesOptions);

  const [category, setCategory] = useState<WeatherCategoryKey>(
    DEFAULT_RANKING_CATEGORY,
  );

  const allMatches = matchesQuery.data ?? EMPTY_MATCHES;
  const recentMatches = useMemo(
    () => allMatches.slice(0, RECENT_LIMIT),
    [allMatches],
  );
  const weatherScores = weatherScoresQuery.data ?? EMPTY_SCORES;
  const teams = teamsQuery.data ?? EMPTY_TEAMS;
  const bestScores = useMemo(
    () => rankWeatherScores(weatherScores, teams, category, "best"),
    [weatherScores, teams, category],
  );
  const worstScores = useMemo(
    () => rankWeatherScores(weatherScores, teams, category, "worst"),
    [weatherScores, teams, category],
  );

  const matchesState = {
    isPending: matchesQuery.isPending,
    isError: matchesQuery.isError,
  };

  return (
    <>
      <DataCoverageStrip matches={allMatches} {...matchesState} />

      <div className="grid grid-cols-3 gap-4 print:grid-cols-1">
        <TeamWeatherEffectCard matches={allMatches} {...matchesState} />
        <AttendanceEffectCard matches={allMatches} {...matchesState} />
      </div>

      <div className="grid grid-cols-3 gap-4 print:grid-cols-1">
        <StrongFavouriteCard matches={allMatches} {...matchesState} />
        <WeatherScoreRankings
          best={bestScores}
          worst={worstScores}
          categoryText={categoryLabel(categoriesQuery.data, category)}
          category={category}
          onCategoryChange={setCategory}
          isPending={
            weatherScoresQuery.isPending ||
            teamsQuery.isPending ||
            categoriesQuery.isPending
          }
          isError={
            weatherScoresQuery.isError ||
            teamsQuery.isError ||
            categoriesQuery.isError
          }
        />
      </div>

      <div className="grid grid-cols-5 gap-4 print:grid-cols-1">
        <WeatherRecordCards matches={allMatches} {...matchesState} />
        <RecentMatchesCard matches={recentMatches} {...matchesState} />
      </div>
    </>
  );
};

export default Dashboard;
