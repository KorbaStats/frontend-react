import { useEffect, useState } from "react";
import { Link } from "react-router";
import { History } from "lucide-react";

import {
  getRecentMatches,
  type MatchWithWeather,
} from "@/services/matchesService";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import MatchesTable from "@/components/shared/MatchesTable";

const RecentMatchesCard = () => {
  const [recentMatches, setRecentMatches] = useState<MatchWithWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // simulates async data fetching (mock serivce)
  useEffect(() => {
    getRecentMatches()
      .then((data) => setRecentMatches(data))
      .catch((err) => {
        setError(`Nie udało sie pobrać meczów.`);
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // loading and error states handling
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          Ostatnie mecze
        </CardTitle>
        <CardDescription>
          Mecze z panującymi warunkami pogodowymi
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <MatchesTable matches={recentMatches} />
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          to="/matches"
          className="text-center text-md text-primary hover:text-secondary-foreground"
        >
          Wszystkie mecze...
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecentMatchesCard;
