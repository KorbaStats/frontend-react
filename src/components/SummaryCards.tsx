import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

import type { MatchStatsSummary } from "@/data/types";
import { getMatchStatsSummary } from "@/services/matchStatsService";
import { CalendarDays, ChartLine, Equal, Users } from "lucide-react";

const SummaryCards = () => {
  const [statsSummary, setStatsSummary] = useState<MatchStatsSummary>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMatchStatsSummary()
      .then((data) => setStatsSummary(data))
      .catch((err) => {
        setError("Pobieranie statystyk nie powiodło się.");
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mb-4">
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mb-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 max-w-4xl mx-auto mb-4">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-muted-foreground text-xs">
            Śledzone mecze
          </CardTitle>
          <CalendarDays size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <span className="text-5xl font-bold">
            {statsSummary?.total_matches}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-muted-foreground text-xs">
            Śrd. goli na mecz
          </CardTitle>
          <ChartLine size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <span className="text-5xl font-bold text-primary">
            {statsSummary?.avg_goals_per_match}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-muted-foreground text-xs">
            Średnia frekwencja
          </CardTitle>
          <Users size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <span className="text-4xl font-bold">
            {Number(statsSummary?.avg_attendance).toLocaleString("pl-PL")}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-muted-foreground text-xs">
            Remisy
          </CardTitle>
          <Equal size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <span className="text-5xl font-bold">
            {statsSummary?.draws}
          </span>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
