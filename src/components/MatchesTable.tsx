import { useEffect, useState } from "react";

import { getRecentMatchesWithWeather, type MatchWithWeather } from "@/services/matchesService";
import { getFormatedDate, getLocalTime } from "@/lib/date";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

import {
  History,
  Sun,
  Cloudy,
  CloudRain,
  CloudSnow,
  Wind,
  ThermometerSun,
  ThermometerSnowflake,
} from "lucide-react";

const weatherConfig = {
  clear: { 
    icon: Sun, 
    label: "Bezchmurnie", 
    bg: "bg-amber-100 dark:bg-amber-900/40", 
    text: "text-amber-500 dark:text-amber-400" 
  },
  clouds: { 
    icon: Cloudy, 
    label: "Pochmurno", 
    bg: "bg-slate-100 dark:bg-slate-800/60", 
    text: "text-slate-500 dark:text-slate-400" 
  },
  rain: { 
    icon: CloudRain, 
    label: "Deszcz", 
    bg: "bg-blue-100 dark:bg-blue-900/40", 
    text: "text-blue-500 dark:text-blue-400" 
  },
  snow: { 
    icon: CloudSnow, 
    label: "Śnieg", 
    bg: "bg-sky-100 dark:bg-sky-900/40", 
    text: "text-sky-500 dark:text-sky-400" 
  },
  wind: { 
    icon: Wind, 
    label: "Wietrznie", 
    bg: "bg-teal-100 dark:bg-teal-900/40", 
    text: "text-teal-500 dark:text-teal-400" 
  },
  extreme_heat: { 
    icon: ThermometerSun, 
    label: "Upał", 
    bg: "bg-red-100 dark:bg-red-900/40", 
    text: "text-red-500 dark:text-red-400" 
  },
  extreme_cold: { 
    icon: ThermometerSnowflake, 
    label: "Mróz", 
    bg: "bg-indigo-100 dark:bg-indigo-900/40", 
    text: "text-indigo-500 dark:text-indigo-400" 
  },
};

const MatchesTable = () => {
  const [recentMatches, setRecentMatches] = useState<MatchWithWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // simulates async data fetching (mock serivce)
  useEffect(() => {
    getRecentMatchesWithWeather()
      .then((data) => setRecentMatches(data))
      .catch((err) => {
        setError(`Nie udało sie pobrać meczów.`)
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
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          Ostatnie mecze
        </CardTitle>
        <CardDescription>Mecze z panującymi warunkami pogodowymi</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="">Gospodarze</TableHead>
              <TableHead className="">Wynik</TableHead>
              <TableHead className="">Goście</TableHead>
              <TableHead className="">Pogoda</TableHead>
              <TableHead className="">Data</TableHead>
              <TableHead className="">Stadion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentMatches.map((m) => {
              // For icons and descriptions of weather
              const condition = m.weather?.condition || "clear";
              const config = weatherConfig[condition];
              const Icon = config.icon;

              return (
                <TableRow key={m.id}>
                  <TableCell className="pl-6 font-medium text-foreground">
                    {m.homeTeam.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex min-w-12 justify-center rounded-md bg-muted px-2 py-0.5 font-semibold tabular-nums text-foreground">
                      {m.home_goals} - {m.away_goals}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {m.awayTeam.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${config.bg} ${config.text}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="font-medium text-foreground">
                          {m.weather?.temperature_c}°C
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium text-foreground">
                        {getFormatedDate(m.datetime)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getLocalTime(m.datetime)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium text-foreground">
                        {m.stadium?.name ?? "Brak stadionu"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {m.stadium?.city ?? "Brak miasta"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MatchesTable;
