import { Calculator } from "lucide-react";

import type { WeatherScoresRecalculation } from "@/data/types";
import { formatDateTime } from "@/lib/date";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WeatherScoresCardProps {
  computedAt: string | undefined;
  isPending: boolean;
  isError: boolean;
  isRecalculating: boolean;
  result: WeatherScoresRecalculation | undefined;
  recalculateError: string | null;
  onRecalculate: () => void;
}

const WeatherScoresCard = ({
  computedAt,
  isPending,
  isError,
  isRecalculating,
  result,
  recalculateError,
  onRecalculate,
}: WeatherScoresCardProps) => (
  <Card>
    <CardHeader className="border-b pb-4">
      <CardTitle className="flex items-center gap-2 text-base">
        <Calculator className="h-4 w-4 text-primary" />
        Weather score
      </CardTitle>
      <CardDescription>
        Przelicza score wszystkich drużyn od nowa. Uruchom po pobraniu pogody lub nowych meczów.
      </CardDescription>
    </CardHeader>

    <CardContent className="flex flex-col gap-4">
      {isPending && <p className="py-10 text-center text-muted-foreground">Ładowanie...</p>}

      {isError && (
        <p className="py-10 text-center text-muted-foreground">
          Nie udało się pobrać weather score
        </p>
      )}

      {!isPending && !isError && (
        <>
          <div>
            <p className="text-sm text-muted-foreground">Ostatnie przeliczenie</p>
            <p className="text-lg font-semibold tabular-nums">
              {computedAt ? formatDateTime(computedAt) : "Jeszcze nie przeliczono"}
            </p>
          </div>

          {recalculateError && <p className="text-sm text-destructive">{recalculateError}</p>}

          <Button onClick={onRecalculate} disabled={isRecalculating}>
            {isRecalculating ? "Przeliczanie..." : "Przelicz weather score"}
          </Button>

          {result && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t pt-4 text-sm tabular-nums text-muted-foreground">
              <span>Drużyny: {result.teams}</span>
              <span>Użyte mecze: {result.matches_used}</span>
              <span>Bez kursów: {result.matches_without_odds}</span>
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

export default WeatherScoresCard;
