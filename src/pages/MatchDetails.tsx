import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { Card, CardContent } from "@/components/ui/card";
import { getMatchById, type MatchWithWeather } from "@/services/matchesService";

import MatchHeaderCard from "@/components/matchpage/MatchHeaderCard";
import MatchStats from "@/components/matchpage/MatchStats";


const MatchDetails = () => {
  const { id } = useParams();
  const matchId = Number(id);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [match, setMatch] = useState<MatchWithWeather>();

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
      <div className="grid grid-cols-2">
        <MatchStats match={match} />
        {/* Chart jakis smieszny */}
      </div>
    </>
  );
};

export default MatchDetails;
