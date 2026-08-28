import { useEffect, useState } from "react";
import { useParams } from "react-router"

import {Card, CardContent} from "@/components/ui/card";

import { type League } from "@/data/types";
import { getLeagueById } from "@/services/leaguesService";

const LeagueDetails = () => {
  const { id } = useParams();
  const leagueId = Number(id);

  const [league, setLeague] = useState<League>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getLeagueById(leagueId)
      .then(setLeague)
      .catch(err => {
        setError(err);
      })
      .finally(() => setIsLoading(false));
  }, [leagueId]);


    if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <CardContent className="py-10 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      Liga: {league?.name}
    </div>
  )
}

export default LeagueDetails;
