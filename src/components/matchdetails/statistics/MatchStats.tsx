import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartColumnIncreasing } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";

import StatRow from "./StatRow";
import ParsedStatRow from "./ParsedStatRow";
import { Button } from "@/components/ui/button";
import { getAllGroups, getTopGroup, type StatGroup } from "./matchStatRows";

interface MatchStatsProps {
  match: MatchWithWeather;
}

const StatSection = ({ group }: { group: StatGroup }) => (
  <section className="space-y-3">
    <h3 className="border-t pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {group.title}
    </h3>
    {group.rows.map((row) =>
      row.kind === "parsed" ? (
        <ParsedStatRow key={row.label} {...row} />
      ) : (
        <StatRow key={row.label} {...row} />
      ),
    )}
  </section>
);

const MatchStats = ({ match }: MatchStatsProps) => {
  const [showAll, setShowAll] = useState(false);

  const topGroup = getTopGroup(match);
  const allGroups = getAllGroups(match);

  return (
    <Card>
      <CardHeader className="my-0">
        <CardTitle className="flex items-center gap-2">
          <ChartColumnIncreasing size={16} className="text-primary" />
          <h1>Statystyki</h1>
        </CardTitle>
        <div className="flex items-center gap-2">
          <h2 className="text-xs text-primary">{match.homeTeam.name}</h2>
          <span className="block bg-primary w-1.5 h-1.5 rounded-full"></span>

          <h2 className="text-xs text-foreground/80">{match.awayTeam.name}</h2>
          <span className="block bg-foreground/80 w-1.5 h-1.5 rounded-full"></span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Top statystyki */}
        <StatSection group={topGroup} />

        {/* Wszystkie statystyki - po rozwinięciu  */}
        {showAll &&
          allGroups.map((group) => (
            <StatSection key={group.title} group={group} />
          ))}
      </CardContent>

      <CardFooter className="justify-center border-t pt-6">
        <Button variant="outline" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Pokaż mniej" : "Pokaż więcej"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MatchStats;
