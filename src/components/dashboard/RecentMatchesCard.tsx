import { Link } from "react-router";
import { History } from "lucide-react";

import {
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

interface RecentMatchesCardProps {
  matches: MatchWithWeather[];
  isPending: boolean,
  isError: boolean,
}

const RecentMatchesCard = ({matches, isPending, isError}: RecentMatchesCardProps) => {
  if (isPending) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie...
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Nie udało się pobrać meczy.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          Ostatnie mecze
        </CardTitle>
        <CardDescription>
          Mecze z panującymi warunkami pogodowymi
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <MatchesTable matches={matches} />
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
