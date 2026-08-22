import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMatchById, type MatchWithWeather } from "@/services/matchesService";

import MatchHeaderCard from "@/components/matchdetails/MatchHeaderCard";
import MatchStats from "@/components/matchdetails/statistics/MatchStats";
import MatchWeatherInsights from "@/components/matchdetails/weatherInsights/MatchWeatherInsights";

const MatchDetails = () => {
  const { id } = useParams();
  const matchId = Number(id);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [match, setMatch] = useState<MatchWithWeather>();

  const [activeTab, setActiveTab] = useState<"stats" | "weather">("weather");

  useEffect(() => {
    getMatchById(matchId)
      .then((data) => {
        setMatch(data);
        setError(null);
      })
      .catch((err) => {
        setError("Nie znaleziono meczu o podanym ID");
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [matchId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie...
        </CardContent>
      </Card>
    );
  }

  if (error || !match) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {error ?? "Nie znaleziono meczu o podanym ID"}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <MatchHeaderCard match={match} />
      <div className="flex gap-2">
        <Button
          aria-pressed={activeTab === "stats"}
          variant={activeTab === "stats" ? "secondary" : "outline"}
          onClick={() => setActiveTab("stats")}
        >
          Statystyki
        </Button>
        <Button
          aria-pressed={activeTab === "weather"}
          variant={activeTab === "weather" ? "secondary" : "outline"}
          onClick={() => setActiveTab("weather")}
        >
          Wpływ pogody
        </Button>
      </div>

      {activeTab === "stats" ? (
        <MatchStats match={match} />
      ) : (
        <MatchWeatherInsights match={match} />
      )}
    </>
  );
};

export default MatchDetails;
